const Scheme = require("../models/Scheme");
const DonorNotification = require("../models/DonorNotification");
console.log("🔥 AUTO EXPIRE RUNNING...");

/* ================= CREATE SCHEME ================= */
exports.createScheme = async (req, res) => {
  try {
    const scheme = new Scheme({
      schemeName: req.body.schemeName,
      description: req.body.description,
      scholarshipAmount: req.body.scholarshipAmount,
      incomeLimit: req.body.incomeLimit,
      educationLevel: req.body.educationLevel,
      ageLimit: req.body.ageLimit,
      category: req.body.category,
      gender: req.body.gender,
      deadline: req.body.deadline,
      documents: req.body.documents,
      documentsList: req.body.documentsList,
      extraConditions: req.body.extraConditions,
      status: "active",
      donorId: req.user.id,
    });

    await scheme.save();

    await DonorNotification.create({
      donorId: req.user.id,
      entity: "scheme",
      title: "Scheme Created",
      message: `Your scheme "${scheme.schemeName}" has been created successfully.`,
      type: "approved",
    });

    res.status(201).json({ message: "Scheme created", scheme });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= GET SINGLE SCHEME ================= */
exports.getSingleScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({ message: "Scheme not found" });
    }

    res.json(scheme);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ================= SAVE DRAFT ================= */
exports.saveDraft = async (req, res) => {
  try {
    const draft = new Scheme({
      ...req.body,
      donorId: req.user.id,
      status: "draft",
    });

    await draft.save();
    res.status(201).json({ message: "Draft saved", draft });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= GET MY SCHEMES ================= */
exports.getMySchemes = async (req, res) => {
  try {
    const filter = { donorId: req.user.id };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const schemes = await Scheme.find(filter).sort({ createdAt: -1 });
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ================= UPDATE SCHEME ================= */
exports.updateScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findOneAndUpdate(
      { _id: req.params.id, donorId: req.user.id },
      req.body,
      { new: true }
    );

    if (!scheme) {
      return res.status(404).json({ message: "Scheme not found" });
    }

    await DonorNotification.create({
      donorId: req.user.id,
      entity: "scheme",
      title: "Scheme Updated",
      message: `Your scheme "${scheme.schemeName}" has been updated.`,
      type: "general",
    });

    res.json({ message: "Scheme updated", scheme });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= CANCEL SCHEME ================= */
exports.cancelScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findOneAndUpdate(
      { _id: req.params.id, donorId: req.user.id },
      { status: "closed" },
      { new: true }
    );

    if (!scheme) {
      return res.status(404).json({ message: "Scheme not found" });
    }

    await DonorNotification.create({
      donorId: req.user.id,
      entity: "scheme",
      title: "Scheme Closed",
      message: `Your scheme "${scheme.schemeName}" has been closed.`,
      type: "closed",
    });

    res.json({ message: "Scheme cancelled", scheme });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ================= AUTO EXPIRE ================= */
exports.autoExpireSchemes = async () => {
  try {
    console.log("🔥 AUTO EXPIRE CHECK RUNNING...");

    const now = new Date();

    const expiredSchemes = await Scheme.find({
      status: "active",
      deadline: { $lt: now },
    });

    console.log("Expired schemes found:", expiredSchemes.length);

    for (const scheme of expiredSchemes) {
      scheme.status = "closed";
      await scheme.save();

      await DonorNotification.create({
        donorId: scheme.donorId, // ✅ CORRECT
        entity: "scheme",
        type: "closed",
        title: "Scheme Expired",
        message: `Your scheme "${scheme.schemeName}" has expired due to deadline.`,
        reason: `Deadline was ${new Date(
          scheme.deadline
        ).toLocaleDateString("en-GB")}`,
      });

      console.log("Closed:", scheme.schemeName);
    }
  } catch (error) {
    console.error("❌ Auto expire error:", error.message);
  }
};

/* ================= DELETE DRAFT ================= */
exports.deleteScheme = async (req, res) => {
  try {
    await Scheme.findOneAndDelete({
      _id: req.params.id,
      donorId: req.user.id,
      status: "draft",
    });

    res.json({ message: "Draft deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ================= STUDENT VIEW ================= */
exports.getAvailableSchemesForStudents = async (req, res) => {
  const schemes = await Scheme.find({ status: "active" });

  res.json({
    success: true,
    count: schemes.length,
    schemes,
  });
};