'use strict'



const getPrivacyPage = async (req, res) => {
  res.locals.pageTitle = 'Privacy notice'
  req.breadcrumbs(res.locals.pageTitle)
  res.render('privacy.ejs', {
    breadcrumbs: req.breadcrumbs()
  })
}

module.exports = { getPrivacyPage }
