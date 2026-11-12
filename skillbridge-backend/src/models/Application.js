const mongoose = require('mongoose');
const { Schema } = mongoose;

const APPLICATION_STATUSES = ['wishlist', 'applied', 'oa', 'interview', 'offer', 'rejected'];

const applicationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  company: { type: String, required: true, trim: true, maxlength: 120 },
  role: { type: String, required: true, trim: true, maxlength: 160 },
  package: { type: String, trim: true, maxlength: 80, default: '' },
  status: { type: String, enum: APPLICATION_STATUSES, default: 'applied' },
  isCampus: { type: Boolean, default: true },
  appliedDate: { type: Date, default: Date.now },
  location: { type: String, trim: true, default: '', maxlength: 160 },
  notes: { type: String, trim: true, default: '', maxlength: 3000 },
}, { timestamps: true });

applicationSchema.methods.toResponseJSON = function () {
  return {
    id: this._id.toString(),
    company: this.company,
    role: this.role,
    package: this.package,
    status: this.status,
    isCampus: this.isCampus,
    appliedDate: this.appliedDate ? this.appliedDate.toISOString().slice(0, 10) : '',
    location: this.location,
    notes: this.notes,
  };
};

applicationSchema.statics.STATUSES = APPLICATION_STATUSES;

module.exports = mongoose.model('Application', applicationSchema);
