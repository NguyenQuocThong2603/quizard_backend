import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import UserService from '../services/user.service.js';

function verifyToken(req, res, next) {
  const { authorization, refreshtoken } = req.headers;
  const token = authorization.split(' ')[1];
  jwt.verify(token, config.JWT_SECRET, async (err, decoded) => {
    if (!err) {
      const { user } = jwt.decode(token);
      req.user = user;
      next();
    } else if (err.message === 'jwt expired') {
      const payload = jwt.decode(token);
      const user = await UserService.findUser(payload.user.email);

      const userDTO = {
        id: user.id,
        email: user.email,
        name: user.name,
        gender: user.gender,
        dob: user.dob,
      };
      if (refreshtoken === user.refreshToken) {
        const newAccessToken = jwt.sign(userDTO, config.JWT_SECRET, { expiresIn: config.EXPIRED_TIME_ACCESS_TOKEN });
        req.setHeader('authorization', newAccessToken);
        next();
      }
    }
    return res.status(401).json({ message: 'Unauthorized' });
  });
}

export default verifyToken;
