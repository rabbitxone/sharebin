import mongoose, { Schema, model, models } from 'mongoose';
import { ST } from 'next/dist/shared/lib/utils';

const LinkSchema = new Schema({
    url: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    clicks: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export const Link = models.Link || model('Link', LinkSchema);