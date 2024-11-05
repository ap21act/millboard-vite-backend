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
    // console.log('Received checkout request:', req.body); // Log request body for debugging

    // Data from the checkout form with cart items
    const { formData, cartItems } = req.body;

    // Destructure the form data
    const { 
      firstName, lastName, email, telephone, companyName, 
      projectLocation, projectOwnerDetail, projectSize, 
      projectStartTime, additionalInfo, enquiryMessage, selectedAddress
    } = formData;

    

   // Check if required fields are missing, excluding optional fields
   const requiredFields = { firstName, lastName, email, telephone, projectLocation, projectOwnerDetail, projectSize, projectStartTime };
    
   const missingFields = Object.entries(requiredFields)
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
    const adminMailOptions = {
      from: `"${firstName} ${lastName}" <${email}>`,
      to: "bharat@kingsburygroup.co.uk",
      cc: "sushantbasnet2027@gmail.com",
      subject: "New Order via Living Outdoors - Dispatch Required",
      html: 
      `<div style="font-family: 'F37 Ginger', Arial, sans-serif; background-color: #f7f8f9; padding: 20px;">
      <style>
        @font-face {
          font-family: 'F37 Ginger';
          src: url('https://res.cloudinary.com/ddtzxyzex/raw/upload/v1730800574/fonts/F37/F37-Ginger-Regular.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
      </style>
      <table style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 20px;">
        <tr>
          <td>
            <!-- Logo and Header -->
            <img src="cid:logo" alt="Living Outdoors" style="width: 300px; height: auto; margin-bottom: 20px;">
            <h1 style="color: #414042; font-size: 24px; margin-bottom: 10px;">New Sample Order - Dispatch Required</h1>
            <p style="margin: 0 0 15px;">Please find the details of the new sample order below. Ensure the items are dispatched promptly.</p>
            
            <!-- Customer Details -->
            <h2 style="color: #799512; font-size: 20px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Customer Information</h2>
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #799512;">${email}</a></p>
            <p><strong>Phone:</strong> ${telephone}</p>
            <p><strong>Company:</strong> ${companyName || 'N/A'}</p>
            ${addressDetails}
            
            <!-- Project Details -->
            <h2 style="color: #799512; font-size: 20px; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 20px;">Project Details</h2>
            <p><strong>Location:</strong> ${projectLocation || 'N/A'}</p>
            <p><strong>Owner Detail:</strong> ${projectOwnerDetail || 'N/A'}</p>
            <p><strong>Size:</strong> ${projectSize || 'N/A'}</p>
            <p><strong>Start Time:</strong> ${projectStartTime || 'N/A'}</p>
            <p><strong>Additional Info:</strong> ${additionalInfo ? 'Yes' : 'No'}</p>
            <p><strong>Message:</strong> ${enquiryMessage || 'N/A'}</p>

            <!-- Order Summary -->
            <h2 style="color: #799512; font-size: 20px; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 20px;">Ordered Products</h2>
            ${cartItems.map((item, index) => `
              <div style="display: flex; align-items: center; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 15px; padding: 15px;">
                <img src="cid:boardImage${index}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover;  margin-right: 15px;">
                <div>
                  <p style="margin: 0; font-size: 12px; color: #888;">${item.category}</p>
                  <h3 style="margin: 5px 0; font-size: 18px; font-weight: bold; color: #333;">${item.type}</h3>
                  <p style="margin: 0; color: #666;">${item.name} - ${item.boardWidth}mm</p>
                  <p style="margin: 10px 0 0; color: #799512; font-weight: bold;">FREE</p>
                </div>
              </div>
            `).join('')}
            <p style="font-size: 12px; color: #999; text-align: center; margin-top: 20px;">
              This email was generated automatically from the Living Outdoors website.
            </p>
          </td>
        </tr>
      </table>
    </div>
  `,
      attachments: [
        {
          filename: 'Millboard_Logo.png',
          path: './Millboard_Logo.png',
          cid: 'logo',
        },
        ...cartItems.map((item, index) => ({
          filename: `board-image-${index}.jpg`,
          path: item.boardImage,
          cid: `boardImage${index}`,
        })),
      ],
    };
  
    const userMailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: `Thank you ${firstName}, for requesting Millboard sample via a Living Outdoors`,
      html: `
        <div style="width: 100%; background-color: #FCFBF7; padding: 20px; font-family: 'F37 Ginger', Arial, sans-serif;">
          <style>
            @font-face {
              font-family: 'F37 Ginger';
              src: url('https://res.cloudinary.com/ddtzxyzex/raw/upload/v1730800574/fonts/F37/F37-Ginger-Regular.ttf') format('truetype');
              font-weight: normal;
              font-style: normal;
            }
            a {
              color: #799512;
              text-decoration: none;
              font-weight: bold;
            }
          </style>
          <table style="max-width: 600px; margin: auto; background-color: #FCFBF7;" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding: 20px; line-height: 1.6; color: #333;">
                <!-- Logo and Header -->
                <img src="cid:logo" alt="Living Outdoors" style="width: 400px; height: auto; margin-bottom: 20px;">
                <h1 style="margin:0; line-height:175%; font-size:28px; color:#3c383d; margin-bottom:10px; font-weight:normal">
                  Thank you, ${firstName}, for choosing Living Outdoors.
                </h1>
                <p style="line-height:175%; margin-bottom:10px">
                  We’ve received your sample request, and our team is already working on it. Your order is being carefully prepared and will reach you within the next 3-5 business days.
                </p>
                <h2 style="margin:0; line-height:175%; font-size:22px; color:#414045; margin-bottom:10px">
                  Discover the Living Outdoors Difference
                </h2>
                <p style="line-height:175%; margin-bottom:10px">
                  Our mission is to bring the beauty of exceptional outdoor spaces right to your doorstep. Your sample will give you the chance to experience the quality and craftsmanship of our decking and cladding collections firsthand.
                </p>
                <p style="line-height:175%; margin-bottom:10px">
                  In the meantime, we invite you to explore <a href="https://thelivingoutdoors.com/our-showrooms" target="_blank style="color: #799512; text-decoration: none;font-weight: bold;">Our Showrooms</a> for creative ideas or browse our <a href="https://thelivingoutdoors.com/inspiration-and-ideas/ideas/gallery" target="_blank" style="color: #799512; text-decoration: none;font-weight: bold;">Inspiration Gallery</a> to see how others have transformed their spaces. If you’re planning your own project, our <a href="https://thelivingoutdoors.com/how-to-guides" target="_blank" style="color: #799512; text-decoration: none;font-weight: bold;">Installation Guides</a> provide helpful tips and guidance.
                </p>
                <p style="line-height:175%; margin-bottom:10px">
                  At Living Outdoors, we believe in the power of quality materials to elevate your outdoor experience. We’re here to support you at every step, and we’re confident that once you feel our products, you’ll be ready to embrace the outdoors like never before.
                </p>
                <p style="line-height:175%; margin-bottom:10px; font-weight:normal">
                  Enjoy your sample, and don’t hesitate to reach out with any questions.
                </p>
                <p style="line-height:175%; margin-bottom:10px; font-weight:bold  font-size:22px; color:#414045; ">
                  Warm Regards,<br>The Living Outdoors Team
                </p>
                <img src="cid:footer" alt="Living Outdoors Banner" style="width: 100%; height: auto; margin-top: 20px;">
              </td>
            </tr>
          </table>
        </div>
      `,
      attachments: [
        {
          filename: 'Millboard_Logo.png',
          path: './Millboard_Logo.png',
          cid: 'logo',
        },
        {
          filename: 'typewriter.gif',
          path: './typewriter.gif',
          cid: 'footer',
        },
      ],
    };
    
    

      // Send email to administrator
      await transport.sendMail(adminMailOptions);

      // Send confirmation email to user
      await transport.sendMail(userMailOptions);

    // console.log('Mail response:', mailResponse); // Log mail response

    return res.status(201).json(new ApiResponse(201, {}, 'Email sent successfully to user and admin'));

  } catch (error) {
    console.error('Error while sending email:', error); // Log the error
    return next(new ApiError(500, 'Failed to send email'));
  }
});

export const sendEnquiryEmail = asyncHandler(async (req, res, next) => {
  try {
    const { firstName, lastName, email, telephone, enquiryMessage, optIn } = req.body;

    // Check for required fields
    const requiredFields = { firstName, lastName, email, telephone, enquiryMessage };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value || value.length === 0)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return next(new ApiError(400, `The following fields are required from the enquiry form: ${missingFields.join(', ')}`));
    }

    // Email options for administrator notification
    const adminMailOptions = {
      from: `"${firstName} ${lastName}" <${email}>`,
      to: "paudeladarsha111@gmail.com",
      cc: optIn ? "marketing@thelivingoutdoors.com" : undefined,
      subject: "New Enquiry via Living Outdoors",
      html: `
        <div style="font-family: 'F37 Ginger', Arial, sans-serif; line-height: 1.5; width: full; margin: auto; color: #333; background-color: #FCFBF7; padding: 20px; border-radius: 8px;">
          <style>
            @font-face {
              font-family: 'F37 Ginger';
              src: url('https://res.cloudinary.com/ddtzxyzex/raw/upload/v1730800574/fonts/F37/F37-Ginger-Regular.ttf') format('truetype');
              font-weight: normal;
              font-style: normal;
            }
          </style>
          <h2 style="color: #2c3e50; border-bottom: 2px solid #799512; padding-bottom: 10px; font-family: 'F37 Ginger';">New Enquiry</h2>
          <p style="margin-bottom: 10px; font-family: 'F37 Ginger';"><strong>Customer Name:</strong> ${firstName} ${lastName}</p>
          <p style="margin-bottom: 10px; font-family: 'F37 Ginger';"><strong>Email:</strong> <a href="mailto:${email}" style="color: #799512; text-decoration: none;font-weight: bold;">${email}</a></p>
          <p style="margin-bottom: 10px; font-family: 'F37 Ginger';"><strong>Telephone:</strong> ${telephone}</p>
          <p style="margin-bottom: 10px; font-family: 'F37 Ginger';"><strong>Enquiry Message:</strong> ${enquiryMessage}</p>
          <p style="margin-bottom: 10px; font-family: 'F37 Ginger';"><strong>Opt-in for updates:</strong> ${optIn ? 'Yes' : 'No'}</p>
          <p style="font-size: 12px; color: #999; text-align: center; margin-top: 20px; font-family: 'F37 Ginger';">
            This email was generated automatically from the Living Outdoors website.
          </p>
        </div>
      `,
    };

    // Email options for user confirmation
    const userMailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: `Thank you ${firstName}, for your enquiry - Living Outdoors`,
      html: `
        <div style="width: 100%; background-color: #FCFBF7; padding: 20px; font-family: 'F37 Ginger', Arial, sans-serif;">
          <table style="max-width: 600px; margin: auto;  border-radius: 8px; padding: 20px;" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding: 20px; line-height: 1.6; color: #333; ">
                <img src="cid:logo" alt="Living Outdoors" style="width: 300px; height: auto; margin-bottom: 20px;">
                <h2 style="color: #2c3e50; font-family: 'F37 Ginger';">Dear ${firstName} ${lastName},</h2>
                <p style="font-family: 'F37 Ginger';">Thank you very much for reaching out to Living Outdoors. We have received your enquiry, and a member of our team will respond within 1-2 working days.</p>
                <p style="font-family: 'F37 Ginger';">If you need immediate assistance, please contact us at the number below or visit our head office in Kentish Town:</p>
                <p style="font-family: 'F37 Ginger';"><strong>Living Outdoors,</strong><br>
                  61 Caversham Road,<br>
                  Kentish Town, NW5 2DH<br>
                  <strong>Phone:</strong> <a href="tel:+4402074824661,12" style="color: #799512; text-decoration: none;font-weight: bold;">020 7482 4661</a>
                </p>
                <h3 style="color: #2c3e50; margin-top: 20px; font-family: 'F37 Ginger';">Enquiry Details</h3>
                <ul style="list-style: none; padding: 0; margin: 0; font-family: 'F37 Ginger';">
                  <li><strong>Name:</strong> ${firstName} ${lastName}</li>
                  <li><strong>Email:</strong> <a href="mailto:${email}" style="color: #799512; text-decoration: none; font-weight: bold;">${email}</a></li>
                  <li><strong>Telephone:</strong> ${telephone}</li>
                  <li><strong>Enquiry Message:</strong> ${enquiryMessage}</li>
                </ul>
                <p style="margin-top: 20px; font-family: 'F37 Ginger';">For more information or assistance, please reply to this email or <a href="mailto:info@thelivingoutdoors.co.uk" style="text-decoration: none; color: #799512; font-weight: bold;">contact us</a>.</p>
                <p style="font-family: 'F37 Ginger';">Additionally, you may find the following links useful:</p>
                <ul style="list-style-type: none; padding: 0; margin: 20px 0; font-family: 'F37 Ginger';">
                  <li><a href="https://thelivingoutdoors.com" style="text-decoration: none; color: #799512; font-weight: bold;">Where to Buy</a></li>
                  <li><a href="https://thelivingoutdoors.com/our-showrooms" style="text-decoration: none; color: #799512; font-weight: bold;">Outdoor Showrooms</a></li>
                  <li><a href="https://www.millboard.com/en-gb/case-studies" style="text-decoration: none; color: #799512; font-weight: bold;">Case Studies</a></li>
                </ul>
                <p style="color: #2c3e50; font-size: 14px; margin-top: 20px; font-family: 'F37 Ginger';"><strong>Living Outdoors Team</strong><br>
                  Website: <a href="https://thelivingoutdoors.com" style="color: #799512; text-decoration: none;font-weight: bold;">www.thelivingoutdoors.com</a>
                </p>
                <img src="cid:footer" alt="Living Outdoors Banner" style="width: 100%; height: auto; margin-top: 20px;">
                <div style="margin-top: 20px; font-size: 12px; color: #999; font-family: 'F37 Ginger';">
                  <p style="margin-bottom: 0;">The Living Outdoors, Global Head Office: 61 Caversham Road, NW5 2DH, Kentish Town, UK.<br>Registration Number: 06061318</p>
                  <p style="margin-top: 10px;">This email, including any attachments, is confidential and may contain privileged information. If you are not the intended recipient, please delete it and notify us immediately. Protect your system from viruses, as we accept no responsibility for any loss or damage caused by them.</p>
                </div>
              </td>
            </tr>
          </table>
        </div>
      `,
      attachments: [
        {
          filename: 'Millboard_Logo.png',
          path: './Millboard_Logo.png',
          cid: 'logo',
        },
        {
          filename: 'typewriter.gif',
          path: './typewriter.gif',
          cid: 'footer',
        },
      ],
    };

    // Send email to administrator
    await transport.sendMail(adminMailOptions);

    // Send confirmation email to user
    await transport.sendMail(userMailOptions);

    return res.status(201).json(new ApiResponse(201, {}, 'Enquiry email sent successfully to both admin and user'));

  } catch (error) {
    console.error('Error while sending enquiry email:', error);
    return next(new ApiError(500, 'Failed to send enquiry email'));
  }
});



