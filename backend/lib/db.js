import mongoose from "mongoose";

// MongoDB connection
export const connectDB = async () => {
  try {
    if (mongoose.connections[0].readyState) {
      return true;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/mindnest");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

// User Schema and Model
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["client", "therapist"],
      default: "client",
    },
    profilePicture: {
      type: String,
      default: "",
    },
    assessments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assessment",
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Therapist Schema and Model
const therapistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    specialization: [
      {
        type: String,
        required: true,
      },
    ],
    bio: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    location: {
      type: String,
      required: true,
    },
    availability: [
      {
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    licenseNumber: {
      type: String,
      required: true,
    },
    education: {
      type: String,
      required: true,
    },
    yearsOfPractice: {
      type: String, // Changed from Number to String to match the form input
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Assessment Schema and Model
const assessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: {
      type: Map,
      of: Number,
      required: true,
    },
    result: {
      prediction: String,
      confidence: Number,
      severity: {
        type: String,
        enum: ["Low", "Mild", "Moderate", "High"],
      },
      recommendations: [String],
      riskFactors: [String],
    },
  },
  {
    timestamps: true,
  },
);

// Appointment Schema and Model
const appointmentSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    therapistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "rescheduled"],
      default: "scheduled",
    },
    notes: {
      type: String,
      default: "",
    },
    sessionType: {
      type: String,
      enum: ["initial", "follow-up", "emergency"],
      default: "follow-up",
    },
  },
  {
    timestamps: true,
  },
);

// Create models
export const User = mongoose.models.User || mongoose.model("User", userSchema);
export const Therapist = mongoose.models.Therapist || mongoose.model("Therapist", therapistSchema);
export const Assessment = mongoose.models.Assessment || mongoose.model("Assessment", assessmentSchema);
export const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);

// Database operations
export const db = {
  users: {
    findByEmail: async (email) => {
      await connectDB();
      return await User.findOne({ email });
    },
    findById: async (id) => {
      await connectDB();
      return await User.findById(id).lean();
    },
    create: async (userData) => {
      await connectDB();
      const user = new User(userData);
      return await user.save();
    },
    update: async (id, updates) => {
      await connectDB();
      return await User.findByIdAndUpdate(id, updates, { new: true }).lean();
    },
  },
  therapists: {
    findAll: async () => {
      await connectDB();
      return await Therapist.find({ verified: true }).populate("userId", "name email profilePicture").lean();
    },
    findById: async (id) => {
      await connectDB();
      return await Therapist.findById(id).populate("userId", "name email profilePicture").lean();
    },
    findByUserId: async (userId) => {
      await connectDB();
      return await Therapist.findOne({ userId }).populate("userId", "name email profilePicture").lean();
    },
    findBySpecialization: async (specialization) => {
      await connectDB();
      return await Therapist.find({
        specialization: { $regex: specialization, $options: "i" },
        verified: true,
      })
        .populate("userId", "name email profilePicture")
        .lean();
    },
    create: async (therapistData) => {
      await connectDB();
      const therapist = new Therapist(therapistData);
      return await therapist.save();
    },
    update: async (id, updates) => {
      await connectDB();
      return await Therapist.findByIdAndUpdate(id, updates, { new: true }).lean();
    },
  },
  assessments: {
    create: async (assessmentData) => {
      await connectDB();
      const assessment = new Assessment(assessmentData);
      const savedAssessment = await assessment.save();

      // Add assessment to user's assessments array
      await User.findByIdAndUpdate(assessmentData.userId, { $push: { assessments: savedAssessment._id } });

      return savedAssessment;
    },
    findByUserId: async (userId) => {
      await connectDB();
      return await Assessment.find({ userId }).lean();
    },
  },
  appointments: {
    create: async (appointmentData) => {
      await connectDB();
      const appointment = new Appointment(appointmentData);
      return await appointment.save();
    },
    findByClientId: async (clientId) => {
      await connectDB();
      return await Appointment.find({ clientId })
        .populate("therapistId", "userId")
        .populate("therapistId.userId", "name email profilePicture")
        .lean();
    },
    findByTherapistId: async (therapistId) => {
      await connectDB();
      return await Appointment.find({ therapistId })
        .populate("clientId", "name email profilePicture")
        .lean();
    },
    updateStatus: async (appointmentId, status) => {
      await connectDB();
      return await Appointment.findByIdAndUpdate(appointmentId, { status }, { new: true }).lean();
    },
    findUpcoming: async (userId, role) => {
      await connectDB();
      const now = new Date();
      const query = role === "therapist" ? { therapistId: userId } : { clientId: userId };
      
      return await Appointment.find({
        ...query,
        date: { $gte: now },
        status: "scheduled"
      })
        .populate(role === "therapist" ? "clientId" : "therapistId", "name email profilePicture")
        .populate(role === "therapist" ? "therapistId.userId" : "therapistId", "name email profilePicture")
        .sort({ date: 1, startTime: 1 })
        .lean();
    },
  },
};
