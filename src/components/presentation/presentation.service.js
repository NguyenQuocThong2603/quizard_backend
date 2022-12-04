import Presentation from './presentation.model.js';

const PresentationService = {

  async find(_id) {
    const presentation = await Presentation.findOne({
      _id,
    });
    return presentation;
  },

  async findPresentationById(presentationId) {
    const presentation = await Presentation.findOne({
      presentationId,
    });
    return presentation;
  },

  async list(groupId) {
    const presentations = await Presentation.find({groupId}).lean();
    return presentations;
  },

  async create(name, owner, group) {
    const newPresentation = await Presentation({
      name,
      owner,
      group
    });
    return newPresentation.save();
  },

  async CountNewPrensentation(defaultName) {
    const regexp = new RegExp("^"+ defaultName);
    return Presentation.count({name: regexp});
  }
};

export default PresentationService;
