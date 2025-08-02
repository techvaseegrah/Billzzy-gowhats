import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      // --- MODIFIED LOGIC ---
      const companyBillNo = parseInt(params.id);
      if (isNaN(companyBillNo)) {
        return NextResponse.json({ error: 'Invalid bill number' }, { status: 400 });
      }
      const organisationId = parseInt(session.user.id);
  
      // Use `updateMany` as (companyBillNo, organisationId) is not a unique constraint
      const updateResult = await prisma.transactionRecord.updateMany({
        where: {
          companyBillNo: companyBillNo,
          organisationId: organisationId
        },
        data: {
          status: 'packed'
        }
      });
  
      if (updateResult.count === 0) {
        return NextResponse.json(
          { error: 'Bill not found or already updated' },
          { status: 404 }
        );
      }

      revalidatePath('/transactions/online');
      revalidatePath('/dashboard');
  
      return NextResponse.json({ 
        success: true,
        message: 'Bill status updated to packed successfully',
      });
  
    } catch (error: any) {
      console.error('Packing status update error:', error.message);
      return NextResponse.json(
        { error: 'Failed to update packing status' },
        { status: 500 }
      );
    }
  }