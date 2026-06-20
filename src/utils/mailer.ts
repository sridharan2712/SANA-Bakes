import nodemailer from 'nodemailer';

const TIME_SLOT_LABELS: Record<string, string> = {
  '10-12': '10:00 AM - 12:00 PM',
  '12-2': '12:00 PM - 02:00 PM',
  '2-4': '02:00 PM - 04:00 PM',
  '4-6': '04:00 PM - 06:00 PM',
};

async function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const secure = process.env.SMTP_SECURE === 'true'; // true for 465, false for other ports
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  // Fallback to test account (Ethereal)
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, 
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

export async function sendOTPEmail(to: string, otp: string) {
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: '"SANA Bakes Security" <security@sanabakes.com>',
      to: to,
      subject: "Your SANA Bakes Password Reset OTP",
      text: `Your heavily secure OTP for password reset is: ${otp}. It is valid for 10 minutes strictly.`,
      html: `<b>Your OTP for password reset is: <span style="font-size: 24px;">${otp}</span></b><br>It is valid for 10 minutes strictly. Do not share this with anybody.`,
    });

    console.log("OTP Message dispatched. ID: %s", info.messageId);
    if (!process.env.SMTP_HOST) {
      console.log("View the dispatched email practically at: %s", nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error("Critical Error interacting with SMTP block for OTP:", error);
    return false;
  }
}

function generateItemsHtml(items: any[]) {
  return items.map((item: any) => {
    let customText = '';
    if (item.weightLabel || item.shape || item.isEggless || item.message) {
      const customizations = [];
      if (item.weightLabel) customizations.push(item.weightLabel);
      if (item.shape) customizations.push(item.shape);
      if (item.isEggless) customizations.push('Eggless');
      
      let customBadge = '';
      if (customizations.length > 0) {
        customBadge = `<div style="color: #475569; font-size: 11px; margin-top: 3px;">${customizations.join(' • ')}</div>`;
      }
      
      let msgText = '';
      if (item.message) {
        msgText = `<div style="color: #be123c; font-size: 11px; margin-top: 3px; font-weight: 600;">🎂 Message: <em>"${item.message}"</em></div>`;
      }
      
      customText = `${customBadge}${msgText}`;
    }

    return `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 12px 0; vertical-align: top; text-align: left;">
          <div style="font-weight: 600; color: #334155; font-size: 14px;">${item.name}</div>
          <div style="color: #94a3b8; font-size: 12px; margin-top: 2px;">Qty: ${item.quantity} • ₹${item.price} each</div>
          ${customText}
        </td>
        <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #1e293b; vertical-align: top; font-size: 14px; width: 100px;">
          ₹${(item.price * item.quantity).toLocaleString('en-IN')}
        </td>
      </tr>
    `;
  }).join('');
}

export async function sendOrderApprovalEmail(to: string, name: string, order: any) {
  try {
    const transporter = await getTransporter();
    const itemsHtml = generateItemsHtml(order.items);
    const timeSlotLabel = order.time_slot ? (TIME_SLOT_LABELS[order.time_slot] || order.time_slot) : 'Not specified';
    
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 16px; background-color: #ffffff; color: #334155;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
          <h1 style="color: #e11d48; margin: 0; font-family: Georgia, serif; font-size: 28px;">SANA Bakes</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Artisanal Luxury, Baked to Order</p>
        </div>
        
        <div style="padding: 30px 0; text-align: center;">
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; padding: 15px; border-radius: 12px; display: inline-block; font-size: 16px; font-weight: bold; margin-bottom: 20px;">
            Thanks for your order! Your order is on time.
          </div>
          <h2 style="color: #1e293b; margin: 0 0 10px 0; font-size: 22px;">Order Confirmed!</h2>
          <p style="color: #64748b; margin: 0; font-size: 14px;">Hi ${name}, your payment has been verified and your order is being prepared with care.</p>
          <p style="color: #64748b; margin: 5px 0 0 0; font-size: 13px; font-family: monospace;">Order ID: ${order.id}</p>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
          <h3 style="color: #0f172a; margin-top: 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; font-size: 16px; text-align: left;">Items Ordered</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsHtml}
          </table>
          <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 1px dashed #cbd5e1; font-weight: bold; color: #0f172a; font-size: 16px;">
            <span>Total Amount:</span>
            <span style="color: #e11d48;">₹${order.total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div style="background-color: #fff1f2; border: 1px solid #ffe4e6; padding: 20px; border-radius: 12px; margin-bottom: 25px; color: #4c0519; text-align: left;">
          <h3 style="color: #9f1239; margin-top: 0; border-bottom: 1px solid #fecdd3; padding-bottom: 8px; font-size: 16px;">Delivery Details</h3>
          <p style="margin: 8px 0; font-size: 14px;"><strong>Date:</strong> ${order.delivery_date || 'Not specified'}</p>
          <p style="margin: 8px 0; font-size: 14px;"><strong>Window:</strong> ${timeSlotLabel}</p>
          <p style="margin: 8px 0; font-size: 14px; line-height: 1.4;"><strong>Address:</strong> ${order.delivery_address || 'Not specified'}</p>
        </div>

        <div style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
          <p style="margin: 0;">If you have any questions, please contact us at support@sanabakes.com.</p>
          <p style="margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} SANA Bakes. All rights reserved.</p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: '"SANA Bakes" <orders@sanabakes.com>',
      to: to,
      subject: `Your SANA Bakes Order has been Confirmed! (#${order.id.substring(0, 8).toUpperCase()})`,
      html: htmlContent,
    });

    console.log("Order Approval Email dispatched. ID: %s", info.messageId);
    if (!process.env.SMTP_HOST) {
      console.log("View the dispatched email practically at: %s", nodemailer.getTestMessageUrl(info));
    }
    return true;
  } catch (error) {
    console.error("Critical Error interacting with SMTP for order approval email:", error);
    return false;
  }
}

export async function sendOrderCancellationEmail(to: string, name: string, order: any) {
  try {
    const transporter = await getTransporter();
    const itemsHtml = generateItemsHtml(order.items);
    
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 16px; background-color: #ffffff; color: #334155;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
          <h1 style="color: #e11d48; margin: 0; font-family: Georgia, serif; font-size: 28px;">SANA Bakes</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Artisanal Luxury, Baked to Order</p>
        </div>
        
        <div style="padding: 30px 0; text-align: center;">
          <div style="background-color: #fef2f2; border: 1px solid #fee2e2; color: #b91c1c; padding: 15px; border-radius: 12px; display: inline-block; font-size: 16px; font-weight: bold; margin-bottom: 20px;">
            Your order is cancelled.
          </div>
          <h2 style="color: #1e293b; margin: 0 0 10px 0; font-size: 22px;">Order Cancellation</h2>
          <p style="color: #64748b; margin: 0; font-size: 14px;">Hi ${name}, we regret to inform you that your payment verification was unsuccessful or rejected. As a result, your order has been cancelled.</p>
          <p style="color: #64748b; margin: 5px 0 0 0; font-size: 13px; font-family: monospace;">Order ID: ${order.id}</p>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
          <h3 style="color: #0f172a; margin-top: 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; font-size: 16px; text-align: left;">Cancelled Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsHtml}
          </table>
          <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 1px dashed #cbd5e1; font-weight: bold; color: #0f172a; font-size: 16px;">
            <span>Total Amount:</span>
            <span style="color: #b91c1c;">₹${order.total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
          <p style="margin: 0;">If you believe this was an error or if you have already been charged, please contact us immediately at support@sanabakes.com.</p>
          <p style="margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} SANA Bakes. All rights reserved.</p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: '"SANA Bakes" <orders@sanabakes.com>',
      to: to,
      subject: `Update regarding your SANA Bakes Order (#${order.id.substring(0, 8).toUpperCase()})`,
      html: htmlContent,
    });

    console.log("Order Cancellation Email dispatched. ID: %s", info.messageId);
    if (!process.env.SMTP_HOST) {
      console.log("View the dispatched email practically at: %s", nodemailer.getTestMessageUrl(info));
    }
    return true;
  } catch (error) {
    console.error("Critical Error interacting with SMTP for order cancellation email:", error);
    return false;
  }
}
