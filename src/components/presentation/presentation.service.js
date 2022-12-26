import Presentation from './presentation.model.js';

const PresentationService = {

  async find(_id) {
    const presentation = Presentation.findOne({
      _id,
    });
    return presentation;
  },

  async findPresentationById(presentationId) {
    const presentation = Presentation.findOne({
      presentationId,
    });
    return presentation;
  },

  async list(ownerId) {
    const presentations = Presentation.find({ owner: ownerId }).lean();
    return presentations;
  },

  async create(name, owner) {
    const time = new Date();
    const newPresentation = Presentation({
      name,
      owner,
      created: time,
      modified: time,
    });
    return newPresentation.save();
  },

  async countNewPrensentation(defaultName) {
    const regexp = new RegExp(`^${defaultName}`);
    return Presentation.count({ name: regexp });
  },

  async delete(_id) {
    return Presentation.deleteOne({ _id });
  },
};

export default PresentationService;
