import mongoose from "mongoose";
import Bootcamp from './Bootcamp';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Add a course title"],
  },
  description: {
    type: String,
    required: [true, "Add a course desciption"],
  },
  weeks: {
    type: String,
    required: [true, "Add number of weeks"],
  },
  tuition: {
    type: Number,
    required: [true, "Add tuition cost"],
  },
  minimumSkill: {
    type: String,
    required: [true, "Add minimum skill level"],
    enum: ["beginner", "intermediate", "advanced"],
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
});

// Static methos for average
courseSchema.statics.getAverageCost = async function (bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: { _id: "$bootcamp", averageCost: { $avg: "$tuition" } },
    },
  ]);

  try {
    await Bootcamp.findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10
    });
  } catch (err) {
    console.error(err);
  }
};

// Get average course cost after save
courseSchema.post("save", function () {
  (this.constructor as any).getAverageCost(this.bootcamp);
});

// Get average course cost before remove
courseSchema.pre("deleteOne", { document: true, query: false }, function () {
  (this.constructor as any).getAverageCost(this.bootcamp);
});

export default mongoose.model("Course", courseSchema);
