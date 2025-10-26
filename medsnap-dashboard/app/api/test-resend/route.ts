import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET() {
    try {
        console.log('Testing Resend connection...');
        console.log('API Key exists:', !!process.env.RESEND_API_KEY);
        console.log('API Key length:', process.env.RESEND_API_KEY?.length);
        console.log('API Key starts with:', process.env.RESEND_API_KEY?.substring(0, 10));

        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json(
                { error: 'RESEND_API_KEY environment variable is not set' },
                { status: 500 }
            );
        }

        const resend = new Resend(process.env.RESEND_API_KEY);
        console.log('Resend instance created');

        // Test the connection by sending a test email to ourselves
        const { data, error } = await resend.emails.send({
            from: 'OSIRIS Bot <noreply@theosirisai.com>',
            to: ['inquiries@theosirisai.com'],
            subject: 'Test Email - Resend Connection',
            html: '<p>This is a test email to verify the Resend connection is working.</p>',
        });

        if (error) {
            console.error('Resend test error:', error);
            console.error('Error type:', typeof error);
            console.error('Error keys:', Object.keys(error));
            return NextResponse.json(
                { error: `Resend connection failed: ${error.message || JSON.stringify(error)}` },
                { status: 500 }
            );
        }

        console.log('Resend connection successful:', data);

        return NextResponse.json({
            success: true,
            message: 'Resend connection successful - test email sent',
            data: data
        });

    } catch (error) {
        console.error('Test endpoint error:', error);
        console.error('Error type:', typeof error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        return NextResponse.json(
            { error: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
        );
    }
}
