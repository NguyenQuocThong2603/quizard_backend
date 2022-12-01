import inviteService from '../services/invite.service.js';
import statusCode from '../constants/statusCode.js';

class InviteController {
  constructor(service) {
    this.service = service;
  }

  async createLink(req, res) {
    const {_id: fromUser} = req.user;
    const {group} = req.body;
    const link = await this.service.createLink(group, fromUser);
    const linkDTO = {
      url: link.url,
      expireDate: link.expireDate,
      group: link.group,
      fromUser: link.fromUser
    }
    return res.status(statusCode.CREATED).json({ message: 'Create invite link successfully', link: linkDTO });
  }
}

export default new InviteController(inviteService);
