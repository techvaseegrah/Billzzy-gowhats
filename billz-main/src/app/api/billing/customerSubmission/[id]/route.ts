import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';

export async function PUT(request: Request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const organisationId = parseInt(session.user.id, 10);
    const body = await request.json();
    const { status } = body;

    await prisma.customerSubmission.update({
      where: { id: parseInt(id, 10) },
      data: {
        status,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error.message);
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
  }
}



export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organisationId = parseInt(session.user.id, 10);
    const submissionId = parseInt(params.id, 10);

    // Verify the submission belongs to the organisation
    const submission = await prisma.customerSubmission.findFirst({
      where: {
        id: submissionId,
        organisationId,
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Delete the submission
    await prisma.customerSubmission.delete({
      where: { id: submissionId },
    });

    return NextResponse.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to delete submission' },
      { status: 500 }
    );
  }
}



export async function GET(request: Request, { params }) {
  try {
    // Authenticate the user
    const session = await getServerSession(authOptions);
console.log("triggred");

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the organization ID from the session
    const organisationId = parseInt(session.user.id, 10);

    // Extract the submission ID from the route parameters
    const id = params.id;

    // Fetch the submission by ID
    const submission = await prisma.customerSubmission.findUnique({
      where: {
        id: parseInt(id, 10),
      },
    });

    // Check if submission exists and belongs to the user's organization
    if (!submission || submission.organisationId !== organisationId) {
      return NextResponse.json({ error: 'Submission not found or unauthorized' }, { status: 404 });
    }

    // Fetch the customer data using customerId
    let customer = null;
    if (submission.customerId) {
      customer = await prisma.customer.findUnique({
        where: {
          id: submission.customerId,
        },
      });
    }

    // Combine submission data with customer data
    const submissionWithCustomer = {
      ...submission,
      customer,
    };

    // Return the submission data
    return NextResponse.json({ submission: submissionWithCustomer }, { status: 200 });
  } catch (error) {
    console.error('Error fetching submission:', error);
    return NextResponse.json({ error: 'Failed to fetch submission' }, { status: 500 });
  }
}









