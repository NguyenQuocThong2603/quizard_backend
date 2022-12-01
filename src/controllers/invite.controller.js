import inviteService from '../services/invite.service.js';
import groupService from '../services/group.service.js';
import statusCode from '../constants/statusCode.js';

class InviteController {
  constructor(service) {
    this.service = service;
  }

  async createLink(req, res) {
    const {_id: fromUser} = req.user;
    const {groupId} = req.body;
    const {_id: group} = await groupService.findGroupById(groupId);
    const link = await this.service.createLink(group, fromUser);
    const linkDTO = {
      url: link.url,
      expireDate: link.expireDate,
      group: link.group,
      fromUser: link.fromUser
    }
    return res.status(statusCode.CREATED).json({ message: 'Create invite link successfully', link: linkDTO });
  }

  async getLink(req, res) {
    const {_id: fromUser} = req.user;
    const {groupId} = req.body;
    console.log(req.body);
    const {_id: group} = await groupService.findGroupById(groupId);
    let link = await this.service.getLink(group, fromUser);
    if (link == null) link = await this.service.createLink(group, fromUser);
    return res.status(statusCode.OK).json(link);
  }
}

export default new InviteController(inviteService);
