const jwt = require('jsonwebtoken');
const User = require('../model/user/user');

const authenticateTAToken = async(req, res, next) => {
  try {
    const bearerToken = req.headers.authorization.split(' ')[1];
    if (bearerToken === null) res.sendStatus(401);
    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET_KEY);
    const user = await User.findOne({email: decoded.email});
    const user_type = user.user_type === 'TA' || user.user_type === 'Admin';
    if (!user || !user_type) res.sendStatus(401);
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
module.exports = authenticateTAToken;
