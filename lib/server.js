module.exports = function (options) {
  const { _ } = this.ndut.helper
  const { ldap, filterToQuery } = this.ndutLdap.helper
  const { getUserByUsernamePassword } = this.ndutAuth.helper
  const server = ldap.createServer()

  const columns = ['id', 'username', 'email', 'firstName', 'lastName', 'address1',
    'address2', 'city', 'zipCode', 'state', 'country', 'phone', 'company', 'department']
  const users = {}

  const getUser = (req, res, next) => {
    req.user = users[req.connection.ldap.bindDN.toString()]
    next()
  }

  const pre = [getUser]

  const addBind = site => {
    const parts = site.hostname.split('.')
    const base = _.map(parts, p => `dc=${p}`).join(',')
    server.bind(base, (req, res, next) => {
      const key = req.dn.toString()
      const username = key.split(',')[0].slice(3)
      const password = req.credentials
      getUserByUsernamePassword(username, password, site.id)
        .then(user => {
          users[key] = _.pick(user, columns)
          res.end()
          next()
        })
        .catch(err => {
          next(new ldap.InvalidCredentialsError())
        })
    })
  }

  const search = site => {
    const parts = site.hostname.split('.')
    const base = _.map(parts, p => `dc=${p}`).join(',')
    server.search(base, pre, (req, res, next) => {
      // TODO: handling with paged result
      // req.controls => PagedResultsControl
      const model = this.ndutDb.model.AbContact
      if (!model) {
        res.end()
        return
      }
      filterToQuery(req.filter)
        .then(where => {
          where.userId = req.user.id
          return model.find({ where })
        })
        .then(results => {
          _.each(results, r => {
            const attributes = this.ndutLdap.helper.contactToAttributes(_.pick(r, columns), options.lowerCaseAttr)
            res.send({
              dn: `cn=${attributes.cn},ou=contacts,${base}`,
              attributes
            })
          })
          res.end()
        })
        .catch(err => {
          next(new ldap.OtherError(err.message))
        })
    })
  }

  return new Promise((resolve, reject) => {
    this.ndutDb.model.SiteInfo.find({ where: { status: 'ENABLED' } })
      .then(sites => {
        _.each(sites, s => {
          addBind(s)
          search(s)
        })
        server.listen(options.server.port, () => {
          this.log.info(`LDAP Server is running at: ${server.url}`)
        })
        resolve()
      })
  })
}