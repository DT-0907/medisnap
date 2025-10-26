import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    console.log('API route called');

    const body = await request.json();
    console.log('Request body:', body);

    const { reason, email, description } = body;

    // Validate required fields
    if (!reason || !email) {
      console.log('Validation failed:', { reason, email });
      return NextResponse.json(
        { error: 'Reason and email are required' },
        { status: 400 }
      );
    }

    console.log('Sending email to inquiries...');

    // Send email to inquiries
    const { data, error } = await resend.emails.send({
      from: 'OSIRIS Bot <noreply@theosirisai.com>',
      to: ['inquiries@theosirisai.com'],
      subject: `New Trial Request: ${reason}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">New OSIRIS Trial Request</h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Request Details</h3>
            <p><strong>Reason:</strong> ${reason}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
          </div>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0369a1; margin-top: 0;">Next Steps</h3>
            <p>Please follow up with this potential customer to schedule their ${reason.toLowerCase()}.</p>
            <p>You can reply directly to: <a href="mailto:${email}">${email}</a></p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This email was sent automatically from the OSIRIS trial form.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: `Failed to send email: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Email sent successfully to inquiries');

    // Send confirmation email to the customer
    const customerEmail = await resend.emails.send({
      from: 'OSIRIS Team <noreply@theosirisai.com>',
      to: [email],
      subject: 'Thank you for your OSIRIS trial request!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Thank you for your interest in OSIRIS!</h2>
          
          <p>Hi there,</p>
          
          <p>Thank you for requesting a ${reason.toLowerCase()} with OSIRIS. We're excited to show you how our AI automation solutions can transform your business!</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">What happens next?</h3>
            <p>Our team will review your request and reach out within 24 hours to schedule your ${reason.toLowerCase()}.</p>
            <p>In the meantime, feel free to explore our website to learn more about our solutions.</p>
          </div>
          
          <p>If you have any immediate questions, you can reply to this email.</p>
          
          <p>Best regards,<br>The OSIRIS Team</p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This is an automated confirmation email. Please do not reply to this address.
          </p>
        </div>
      `,
    });

    console.log('Confirmation email sent to customer');

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      data: data
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
