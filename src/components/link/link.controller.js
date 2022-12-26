import GroupService from '../group/group.service.js';
import statusCode from '../../constants/statusCode.js';
import LinkService from './link.service.js';

const LinkController = {
  async createLink(req, res) {
    const { id: fromUser } = req.user;
    const { groupId } = req.body;
    const { id: group } = await GroupService.findGroupById(groupId);
    const link = await LinkService.createLink(group, fromUser);
    const linkDTO = {
      url: link.url,
      expireDate: link.expireDate,
      group: link.group,
      fromUser: link.fromUser,
    };
    return res.status(statusCode.CREATED).json({ message: 'Create link successfully', link: linkDTO });
  },

  async getLink(req, res) {
    const { id: fromUser } = req.user;
    const { groupId } = req.body;
    console.log(req.body);
    const { id: group } = await GroupService.findGroupById(groupId);
    let link = await LinkService.getLink(group, fromUser);
    if (link == null) link = await LinkService.createLink(group, fromUser);
    return res.status(statusCode.OK).json(link);
  },
  async checkLink(req, res) {
    try {
      const { url } = req.body;
      const link = await LinkService.findByUrl(url);
      if (!link) {
        return res.status(statusCode.NOT_FOUND).json({ message: 'Link not found' });
      }
      const now = Date.now();
      const expiredTime = Math.floor(link.expireDate.getTime());
      if (expiredTime - now <= 0) {
        return res.status(statusCode.BAD_REQUEST).json({ message: 'Expired link' });
      }
      return res.status(statusCode.OK).json(link);
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  },
};

export default LinkController;
