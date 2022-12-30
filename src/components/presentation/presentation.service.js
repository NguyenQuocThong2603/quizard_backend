import Presentation from './presentation.model.js';

const PresentationService = {

  async find(_id) {
    const presentation = Presentation.findOne({
      _id,
    });
    return presentation;
  },

  async list(groupId) {
    const transform = (doc, id) => ((doc == null) ? 'Unknown' : doc.name);
    const presentations = Presentation.find({ groupId })
      .populate([{ path: 'owner', transform }]);
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

  async updateCurrentSession(_id, currentSession) {
    return Presentation.updateOne({_id}, {currentSession});
  },

  async updateCurrentSlideIndex(_id, currentSlideIndex) {
    return Presentation.updateOne({_id}, {currentSlideIndex});
  }
  
};

export default PresentationService;
