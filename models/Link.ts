import mongoose, { Schema, model, models } from 'mongoose';
import { ST } from 'next/dist/shared/lib/utils';

const LinkSchema = new Schema({
    url: {
        type: String,
        required: true
    },
    osUrls: {
        type: Map,
        of: String,
        default: {}
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
    },
    expirationDate: {
        type: Date,
        default: null
    },
    clickLimit: {
        type: Number,
        default: null
    }
}, { timestamps: true });

export const Link = models.Link || model('Link', LinkSchema);