import nodemailer from 'nodemailer';
import { ApiResponse, ApiError, asyncHandler } from '../utils/index.js';

// Nodemailer transporter setup
const transport = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  secure: true, // Use true for SSL connection
  auth: {
    user: process.env.EMAIL_USERNAME, // Your Gmail account used for authentication
    pass: process.env.EMAIL_PASSWORD, // Your Gmail password or app password
  },
});

export const sendEmailForCheckout = asyncHandler(async (req, res, next) => {
  try {
    console.log('Received checkout request:', req.body); // Log request body for debugging

    // Data from the checkout form with cart items
    const { formData, cartItems } = req.body;

    // Destructure the form data
    const { 
      firstName, lastName, email, telephone, companyName, 
      projectLocation, projectOwnerDetail, projectSize, 
      projectStartTime, additionalInfo, enquiryMessage, selectedAddress
    } = formData;

    

    // Check if any required fields are missing
    const missingFields = Object.entries(formData)
      .filter(([_, value]) => !value || value.length === 0)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields); // Log missing fields
      return next(new ApiError(400, `The following fields are required from the request body of Checkout: ${missingFields.join(', ')}`));
    }

    // Construct address from selectedAddress
    const addressDetails = `
      <div style="margin: 10px 0;">
        <strong>Address:</strong>
        <p style="margin: 5px 0;">${selectedAddress.line_1 || ''}</p>
        <p style="margin: 5px 0;">${selectedAddress.line_2 || ''}</p>
        <p style="margin: 5px 0;">${selectedAddress.town_or_city || ''}</p>
        <p style="margin: 5px 0;">${selectedAddress.county || ''}</p>
        <p style="margin: 5px 0;">${selectedAddress.postcode || ''}</p>
        <p style="margin: 5px 0;">${selectedAddress.country || 'N/A'}</p>
      </div>
    `;

    // Email options with dynamic 'from' field and cart items with images
    const mailOptions = {
      from: `"${firstName} ${lastName}" <${email}>`,
      to: "bharat@kingsburygroup.co.uk",
      cc: "sushantbasnet2027@gmail.com",
      subject: "New Sample Order via Living Outdoors ",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 600px; margin: auto; color: #333;">
          <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">New Sample Order Request</h2>
          <div style="margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>Customer Name:</strong> ${firstName} ${lastName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #3498db;">${email}</a></p>
            <p style="margin: 5px 0;"><strong>Telephone:</strong> ${telephone}</p>
            <p style="margin: 5px 0;"><strong>Company Name:</strong> ${companyName || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Project Location:</strong> ${projectLocation || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Project Owner Detail:</strong> ${projectOwnerDetail || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Project Size:</strong> ${projectSize || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Project Start Time:</strong> ${projectStartTime || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Additional Info:</strong> ${additionalInfo ? 'Yes' : 'No'}</p>
            <p style="margin: 5px 0;"><strong>Enquiry Message:</strong> ${enquiryMessage || 'N/A'}</p>
          </div>
          ${addressDetails}
          <h3 style="color: #3498db; margin-top: 30px;">Ordered Products:</h3>
          ${cartItems.map((item, index) => `
            <div style="display: flex; align-items: center; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 15px; padding: 15px;">
              <div style="margin-right: 15px;">
                <img 
                  src="cid:boardImage${index}" 
                  alt="${item.name}" 
                  style="width: 100px; height: 100px; object-fit: cover; display: block; border-radius: 5px;" 
                />
              </div>
              <div style="flex-grow: 1;">
                <p style="margin: 0; color: #888; font-size: 12px;">${item.category}</p>
                <h4 style="margin: 5px 0; font-size: 20px; font-weight: bold; color: #333;">${item.type}</h4>
                <p style="margin: 0; color: #666;">${item.name} - ${item.boardWidth}mm</p>
                <p style="margin: 10px 0 0; color: green; font-weight: bold;">FREE</p>
              </div>
            </div>
          `).join('')}
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #999;">
              This email was generated from the Living Outdoors website.
            </p>
            <p style="font-size: 12px; color: #999;">
              For further details, please contact our support team at 
              <a href="mailto:info@thelivingoutdoors.co.uk" style="color: #0066cc; text-decoration: none;">info@thelivingoutdoors.co.uk</a>.
            </p>
            <p style="font-size: 12px; color: #999; text-align: center;">
              Visit our website at 
              <a href="https://www.thelivingoutdoors.com" style="color: #0066cc; text-decoration: none;">Living Outdoors</a>
            </p>
          </div>
        </div>
      `,
      attachments: cartItems.map((item, index) => ({
        filename: `board-image-${index}.jpg`,
        path: item.boardImage,
        cid: `boardImage${index}`,
      })),
    };

    // Send email using transporter
    const mailResponse = await transport.sendMail(mailOptions);

    console.log('Mail response:', mailResponse); // Log mail response

    return res.status(201).json(new ApiResponse(201, mailResponse, 'Email sent successfully to Bharat'));

  } catch (error) {
    console.error('Error while sending email:', error); // Log the error
    return next(new ApiError(500, 'Failed to send email'));
  }
});

export const sendEnquiryEmail = asyncHandler(async (req, res, next) => {
  try {
    console.log('Received enquiry request:', req.body); // Log request body for debugging

    // Data from the enquiry form
    const { firstName, lastName, email, telephone, enquiryMessage, optIn } = req.body;

    // Required fields for validation
    const requiredFields = { firstName, lastName, email, telephone, enquiryMessage };
    
    // Check if any required fields are missing
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value || value.length === 0)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields); // Log missing fields
      return next(new ApiError(400, `The following fields are required from the enquiry form: ${missingFields.join(', ')}`));
    }

    // Email options with enquiry details
    const mailOptions = {
      from: `"${firstName} ${lastName}" <${email}>`,
      to: "bharat@kingsburygroup.co.uk", // Replace with your destination email
      cc: optIn ? "marketing@thelivingoutdoors.com" : undefined, // Optional cc if opt-in
      subject: "New Enquiry via Living Outdoors",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 600px; margin: auto; color: #333;">
          <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">New Enquiry</h2>
          <div style="margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>Customer Name:</strong> ${firstName} ${lastName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #3498db;">${email}</a></p>
            <p style="margin: 5px 0;"><strong>Telephone:</strong> ${telephone}</p>
            <p style="margin: 5px 0;"><strong>Enquiry Message:</strong></p>
            <p style="background-color: #f9f9f9; padding: 10px; border-left: 4px solid #3498db; margin: 10px 0;">${enquiryMessage}</p>
            <p style="margin: 5px 0;"><strong>Opt-in for updates:</strong> ${optIn ? 'Yes' : 'No'}</p>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #999;">
              This email was generated from the Living Outdoors website.
            </p>
            <p style="font-size: 12px; color: #999;">
              For further details, please contact our support team at 
              <a href="mailto:info@thelivingoutdoors.co.uk" style="color: #0066cc; text-decoration: none;">info@thelivingoutdoors.co.uk</a>.
            </p>
          </div>
        </div>
      `,
    };

    // Send email using transporter
    const mailResponse = await transport.sendMail(mailOptions);

    console.log('Mail response:', mailResponse); // Log mail response

    return res.status(201).json(new ApiResponse(201, mailResponse, 'Enquiry email sent successfully'));

  } catch (error) {
    console.error('Error while sending enquiry email:', error); // Log the error
    return next(new ApiError(500, 'Failed to send enquiry email'));
  }
});
