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
        required: false, // Changed to false to allow empty during initial creation
      },
    ],
    bio: {
      type: String,
      required: false, // Changed to false to allow empty during initial creation
      maxlength: 1000,
    },
    location: {
      type: String,
      required: false, // Changed to false to allow empty during initial creation
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
      required: false, // Changed to false to allow empty during initial creation
    },
    education: {
      type: String,
      required: false, // Changed to false to allow empty during initial creation
    },
    yearsOfPractice: {
      type: String, // Changed from Number to String to match the form input
      required: false, // Changed to false to allow empty during initial creation
    },
    onboarded: {
      type: Boolean,
      default: false,
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
    time: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["individual", "couples", "family", "group"],
      default: "individual",
    },
    status: {
      type: String,
      enum: ["scheduled", "confirmed", "completed", "cancelled", "rescheduled"],
      default: "scheduled",
    },
    notes: {
      type: String,
      default: "",
    },
    paymentId: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["credit-card", "debit-card", "paypal"],
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

// Add unique compound index to prevent double booking
appointmentSchema.index({ therapistId: 1, date: 1, time: 1 }, { unique: true });

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
    findOne: async (query) => {
      await connectDB();
      return await Therapist.findOne(query).populate("userId", "name email profilePicture").lean();
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
    findBySpecializations: async (specializations, options = {}) => {
      await connectDB();
      const query = {
        specialization: { $in: specializations },
        verified: true,
      };

      let queryBuilder = Therapist.find(query).populate("userId", "name email profilePicture");

      if (options.limit) {
        queryBuilder = queryBuilder.limit(options.limit);
      }

      return await queryBuilder.lean();
    },
    findAll: async (options = {}) => {
      await connectDB();
      // Show all therapists, prioritizing those who are onboarded and verified
      let queryBuilder = Therapist.find({})
        .populate("userId", "name email profilePicture")
        .sort({ onboarded: -1, verified: -1, createdAt: -1 });

      if (options.limit) {
        queryBuilder = queryBuilder.limit(options.limit);
      }

      return await queryBuilder.lean();
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
    findByUserId: async (userId, options = {}) => {
      await connectDB();
      let queryBuilder = Assessment.find({ userId }).populate("userId", "name email");

      if (options.limit) {
        queryBuilder = queryBuilder.limit(options.limit);
      }

      if (options.sort) {
        queryBuilder = queryBuilder.sort(options.sort);
      }

      return await queryBuilder.lean();
    },
    findByUserIds: async (userIds, options = {}) => {
      await connectDB();
      let query = Assessment.find({ userId: { $in: userIds } }).populate("userId", "name email");

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.sort) {
        query = query.sort(options.sort);
      }

      return await query.lean();
    },
    findByUserIds: async (userIds, options = {}) => {
      await connectDB();
      let queryBuilder = Assessment.find({ userId: { $in: userIds } }).populate("userId", "name email");

      if (options.limit) {
        queryBuilder = queryBuilder.limit(options.limit);
      }

      if (options.sort) {
        queryBuilder = queryBuilder.sort(options.sort);
      }

      return await queryBuilder.lean();
    },
    findById: async (id) => {
      await connectDB();
      return await Assessment.findById(id).populate("userId", "name email").lean();
    },
  },
  appointments: {
    create: async (appointmentData) => {
      await connectDB();
      const appointment = new Appointment(appointmentData);
      return await appointment.save();
    },
    update: async (id, updates) => {
      await connectDB();
      return await Appointment.findByIdAndUpdate(id, updates, { new: true }).lean();
    },
    findById: async (appointmentId) => {
      await connectDB();
      return await Appointment.findById(appointmentId).lean();
    },
    findByClientId: async (clientId) => {
      await connectDB();
      return await Appointment.find({ clientId })
        .populate({
          path: "therapistId",
          populate: {
            path: "userId",
            select: "name email profilePicture"
          }
        })
        .sort({ date: -1, time: -1 })
        .lean();
    },
    findByTherapistId: async (therapistId) => {
      await connectDB();
      return await Appointment.find({ therapistId })
        .populate({
          path: "clientId",
          select: "name email profilePicture"
        })
        .sort({ date: -1, time: -1 })
        .lean();
    },
    findByTherapistIdWithClientDetails: async (therapistId) => {
      await connectDB();
      return await Appointment.find({ therapistId })
        .populate({
          path: "clientId",
          select: "name email profilePicture"
        })
        .sort({ date: -1, time: -1 })
        .lean();
    },
    findByTherapistId: async (therapistId) => {
      await connectDB();
      return await Appointment.find({ therapistId })
        .populate("clientId", "name email profilePicture")
        .lean();
    },
    findByTherapistIdWithClientDetails: async (therapistId) => {
      await connectDB();
      return await Appointment.find({ therapistId })
        .populate("clientId", "name email profilePicture")
        .sort({ date: -1, time: -1 })
        .lean();
    },
    findByTherapistIdAndDate: async (therapistId, date) => {
      await connectDB();
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      return await Appointment.find({
        therapistId,
        date: { $gte: startOfDay, $lte: endOfDay }
      }).lean();
    },
    findByTherapistIdAndDateTime: async (therapistId, date, time) => {
      await connectDB();
      const appointmentDate = new Date(date);
      appointmentDate.setHours(0, 0, 0, 0);

      return await Appointment.findOne({
        therapistId,
        date: appointmentDate,
        time
      }).lean();
    },
    findUpcomingByTherapist: async (therapistId) => {
      await connectDB();
      const now = new Date();
      return await Appointment.find({
        therapistId,
        date: { $gte: now },
        status: { $in: ['scheduled', 'confirmed'] }
      })
        .populate("clientId", "name email profilePicture")
        .sort({ date: 1, time: 1 })
        .lean();
    },
    findUpcomingByClient: async (clientId) => {
      await connectDB();
      const now = new Date();
      return await Appointment.find({
        clientId,
        date: { $gte: now },
        status: { $in: ['scheduled', 'confirmed'] }
      })
        .populate("therapistId", "userId")
        .populate("therapistId.userId", "name email profilePicture")
        .sort({ date: 1, time: 1 })
        .lean();
    },
    countByTherapistId: async (therapistId) => {
      await connectDB();
      return await Appointment.countDocuments({ therapistId });
    },
    countByTherapistIdAndStatus: async (therapistId, status) => {
      await connectDB();
      return await Appointment.countDocuments({ therapistId, status });
    },
    countUniqueClientsByTherapistId: async (therapistId) => {
      await connectDB();
      const uniqueClients = await Appointment.distinct('clientId', { therapistId });
      return uniqueClients.length;
    },
    findScheduledByClient: async (clientId) => {
      await connectDB();
      const now = new Date();
      return await Appointment.find({
        clientId,
        date: { $gte: now },
        status: 'scheduled'
      })
        .populate("therapistId", "userId")
        .populate("therapistId.userId", "name email profilePicture")
        .sort({ date: 1, time: 1 })
        .lean();
    },
    updateStatus: async (appointmentId, status) => {
      await connectDB();
      return await Appointment.findByIdAndUpdate(appointmentId, { status }, { new: true }).lean();
    },
    updateDateTime: async (appointmentId, date, time) => {
      await connectDB();
      return await Appointment.findByIdAndUpdate(
        appointmentId, 
        { date: new Date(date), time }, 
        { new: true }
      ).lean();
    },
    findByIdWithDetails: async (appointmentId) => {
      await connectDB();
      return await Appointment.findById(appointmentId)
        .populate("clientId", "name email profilePicture")
        .populate("therapistId", "userId")
        .populate("therapistId.userId", "name email profilePicture")
        .lean();
    },
    countByTherapistId: async (therapistId) => {
      await connectDB();
      return await Appointment.countDocuments({ therapistId });
    },
    countByTherapistIdAndStatus: async (therapistId, status) => {
      await connectDB();
      return await Appointment.countDocuments({ therapistId, status });
    },
    countByClientId: async (clientId) => {
      await connectDB();
      return await Appointment.countDocuments({ clientId });
    },
    countByClientIdAndStatus: async (clientId, status) => {
      await connectDB();
      return await Appointment.countDocuments({ clientId, status });
    },
    countUniqueClientsByTherapistId: async (therapistId) => {
      await connectDB();
      return await Appointment.distinct("clientId", { therapistId });
    },
    countUniqueTherapistsByClientId: async (clientId) => {
      await connectDB();
      return await Appointment.distinct("therapistId", { clientId });
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
