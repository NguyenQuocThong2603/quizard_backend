import GroupService from '../group/group.service.js';
import statusCode from '../../constants/statusCode.js';
import InviteService from './invite.service.js';

const InviteController = {
  async createLink(req, res) {
    const { _id: fromUser } = req.user;
    const { groupId } = req.body;
    const { _id: group } = await GroupService.findGroupById(groupId);
    const link = await InviteService.createLink(group, fromUser);
    const linkDTO = {
      url: link.url,
      expireDate: link.expireDate,
      group: link.group,
      fromUser: link.fromUser,
    };
    return res.status(statusCode.CREATED).json({ message: 'Create invite link successfully', link: linkDTO });
  },

  async getLink(req, res) {
    const { _id: fromUser } = req.user;
    const { groupId } = req.body;
    console.log(req.body);
    const { _id: group } = await GroupService.findGroupById(groupId);
    let link = await InviteService.getLink(group, fromUser);
    if (link == null) link = await InviteService.createLink(group, fromUser);
    return res.status(statusCode.OK).json(link);
  },
};

export default InviteController;
