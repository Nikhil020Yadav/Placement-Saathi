import mongoose, { Schema } from "mongoose";

const blogSchema = mongoose.Schema({

    blog_id: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: true,
    },
    banner: {
        type: String,
        // required: true,
    },
    company: {
        type: String,
        //required: true,
        trim: true
    },
    jobRole: {
        type: String,
        //required: true,
        trim: true
    },
    department: {
        type: String,
        //required: true,
        trim: true
    },
    ctc: {
        type: String,
        //required: true,
        trim: true
    },
    year: {
        type: String,
        //required: true,
        trim: true
    },
    experience: {
        type: String,
        //required: true,
        trim: true
    },
    preparation: {
        type: String,
        //required: true,
        trim: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
        //required: true
    },
    offerType: {
        type: String,
        trim: true
    },

    tags: {
        type: [String],
        // required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    activity: {
        total_likes: {
            type: Number,
            default: 0
        },
        total_comments: {
            type: Number,
            default: 0
        },
        total_reads: {
            type: Number,
            default: 0
        },
        total_parent_comments: {
            type: Number,
            default: 0
        },
    },
    comments: {
        type: [Schema.Types.ObjectId],
        ref: 'comments'
    },
    draft: {
        type: Boolean,
        default: false
    }

},
    {
        timestamps: {
            createdAt: 'publishedAt'
        }

    })

export default mongoose.model("blogs", blogSchema);