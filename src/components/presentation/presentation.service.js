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
    const transform = (doc, id) => (doc == null) ? "Unknown" : doc.name;
    const presentations = await Presentation.find({ groupId })
      .populate([{path: "owner", transform}]).lean();
    return presentations;
  },

  async create(name, owner, group) {
    const time = new Date();
    const newPresentation = await Presentation({
      name,
      owner,
      group,
      created: time,
      modified: time
    });
    return newPresentation.save();
  },

  async countNewPrensentation(defaultName) {
    const regexp = new RegExp(`^${defaultName}`);
    return Presentation.count({ name: regexp });
  },

  async delete(_id) {
    return Presentation.deleteOne({_id});
  }
};

export default PresentationService;
