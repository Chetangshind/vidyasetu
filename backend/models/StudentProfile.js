const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
    },

 personal: {
  type: {
    aadhaar: String,
    name: String,
    email: String,
    mobile: String,
    dob: String,
    age: Number,
    gender: String,
    parentMobile: String,
    maritalStatus: String,
    religion: String,
    preferredReligion: String,
    casteCategory: String,
    preferredCasteCategory: String,
    casteSelect: String,
    caste: String,
    preferredCaste: String,
    subCaste: String,
    preferredSubCaste: String,
    income: String,
    incomeCertNo: String,
    domicileCertNo: String,
    domicileOwner: String,
    salaried: String,
    disability: String,
    incomeCertificate: String,
    domicileCertificate: String,

    // ✅ MOVE OTHER DOCS HERE
    otherDocuments: [
      {
        documentName: String,
        documentNumber: String,
        file: String,
      },
    ],
  },
  default: {},
},

    address: {
      type: Object,
      default: null,
    },

    other: {
      type: Object,
      default: null,
    },

    courseList: {
      type: Object,
      default: null,
    },

    qualificationRecords: {
      type: Object,
      default: null,
    },

    collegeBank: {
      type: Object,
      default: null,
    },

    hostelRecords: {
      type: Object,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentProfile", studentProfileSchema);
