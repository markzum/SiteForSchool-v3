var jwt = require('jsonwebtoken')
const tokenKey = '8a5b-3c67d-5epf-7gm9'





// checkAuth
function checkAuth(req, res, next) {
    // get cookies
    let token = req.cookies.token

    if (!token) {
        return res.redirect("/admin/login")
    }

    jwt.verify(token, tokenKey, function(err, decoded) {
        if (decoded) {
            return next()
        } else {
            return res.redirect("/admin/login")
        }

    });
}



function isAlertsOp(req, res, next) {
    let token = req.cookies.token
    const payload = jwt.verify(token, tokenKey, { ignoreExpiration: true });
    if (payload.role === "alerts_op" || payload.role === "main_admin") {
        return next()
    } else {
        return res.redirect("/admin/login")
    }
}



function isPersonsOp(req, res, next) {
    let token = req.cookies.token
    const payload = jwt.verify(token, tokenKey, { ignoreExpiration: true });
    if (payload.role === "persons_op" || payload.role === "main_admin") {
        return next()
    } else {
        return res.redirect("/admin/login")
    }
}



function isSocialPedagogueOp(req, res, next) {
    let token = req.cookies.token
    const payload = jwt.verify(token, tokenKey, { ignoreExpiration: true });
    if (payload.role === "social_pedagogue_op" || payload.role === "main_admin") {
        return next()
    } else {
        return res.redirect("/admin/login")
    }
}





module.exports = {
    checkAuth: checkAuth,
    isAlertsOp: isAlertsOp,
    isPersonsOp: isPersonsOp,
    isSocialPedagogueOp: isSocialPedagogueOp
};