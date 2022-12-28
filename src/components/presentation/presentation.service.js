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

  async getOwnedPresentations(ownerId) {
    const presentations = Presentation.find({ owner: ownerId }).populate('owner').lean();
    return presentations;
  },

  async getCollaboratePresentations(collaboratorId) {
    const presentations = Presentation.find({ collaborators: collaboratorId }).populate('owner').lean();
    return presentations;
  },

  async getCollaborators(presentationId) {
    const collaborators = Presentation.findOne({ _id: presentationId })
      .populate('collaborators', ['_id', 'name', 'email']).lean();
    return collaborators;
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
