import mongoose, { Schema } from "mongoose";

import slugify from "slugify";

// Define the sub-schema for board specifications
const boardSpecificationSchema = new Schema({
    boardWidth: {
        type: Number,
        required: [true, "Board width is required"],
        default: 0
    },
    weight: {
        type: Number,
        required: [true, 'Weight per m2(kg) is required'],
        default: 0
    },
    fixing: {
        type: Number,
        required: [true, "Fixing per board is required"],
        default: 0
    },
    numberOfBoards: {
        type: Number,
        required: [true, "Number of boards per m2 is required"],
        default: 0
    },
    sku: {
        type: String,
        required: [true, "SKU is required"],
        unique: true,
        uppercase: true
    },
    length: {
        type: Number,
        required: [true, "Length is required in mm for dimensions"],
        default: 0
    },
    breadth: {
        type: Number,
        required: [true, "Breadth is required in mm for dimensions"],
        default: 0
    },
    height: {
        type: Number,
        required: [true, "Height is required in mm for dimensions"],
        default: 0
    }
}, { timestamps: true });

// Define the main product schema
const productSchema = new Schema({
    name: {
        type: String,
        required: [true, "Product name is required"],
        
    },
    slug: {
        type: String,
        unique: true,

    },
    category: {
        type: String,
        enum: ['Decking', 'Cladding'],
        required: [true, 'Category name such as Decking']
    },
    subCategory: {
        type: String,
        enum: ['Collection', 'Accessories'],
        required: [true, 'Sub-category name such as Collection']
    },
    type: {
        type: String,
        required: [true, 'Type name such as Enhanced Grain']
    },
    description: {
        type: String,
        required: true
    },
    colour: {
        type: String,
        required: true
    },
    images:{
        titleImage: {
            type: String,
            required: true
        },
        boardImage: {
            type: String,
            required: true
        },
        productImage: {
            type: [String],
            validate: [arrayLimitProductImages, 'You can only provide two images.'],
            required: true
        },
        inspirationGallery: {
            type: [String],
            validate: [arrayLimitInspirationGallery, 'You can only provide up to eight images.'],
            required: true
        },
    },
    boardSpecifications: [boardSpecificationSchema] // Array of board specifications
}, { timestamps: true });

// Custom validator for productImage array limit
function arrayLimitProductImages(val) {
    return val.length <= 2; // Limit to two images
}

// Custom validator for inspirationGallery array limit
function arrayLimitInspirationGallery(val) {
    return val.length <= 8; // Limit to eight images
}
// Pre-save hook to generate slug
productSchema.pre('save', function (next) {
    if (this.isModified('name') || this.isModified('type') || this.isModified('subCategory') || this.isModified('category')) {
        this.slug = slugify(`${this.category}/${this.subCategory}/${this.type}/${this.name}`, {
            lower: true,
            strict: true,
            replacement: '-'
        });
    }
    next();
});

// Export the Product model
export const Product = mongoose.model('Product', productSchema);
