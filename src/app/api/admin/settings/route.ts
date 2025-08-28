import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/server/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch settings from database or return defaults
    const settings = await prisma.setting.findMany();
    
    // Convert settings array to structured object
    const settingsObj = {
      general: {
        siteName: settings.find(s => s.key === 'siteName')?.value || 'Tamil Spice Bazaar',
        siteDescription: settings.find(s => s.key === 'siteDescription')?.value || 'Authentic Tamil Nadu spices and ingredients',
        contactEmail: settings.find(s => s.key === 'contactEmail')?.value || 'contact@tamilspicebazaar.com',
        supportEmail: settings.find(s => s.key === 'supportEmail')?.value || 'support@tamilspicebazaar.com'
      },
      commerce: {
        currency: settings.find(s => s.key === 'currency')?.value || 'INR',
        taxRate: parseFloat(settings.find(s => s.key === 'taxRate')?.value || '18'),
        defaultCommissionRate: parseFloat(settings.find(s => s.key === 'defaultCommissionRate')?.value || '10'),
        minimumOrderAmount: parseInt(settings.find(s => s.key === 'minimumOrderAmount')?.value || '50000'),
        freeShippingThreshold: parseInt(settings.find(s => s.key === 'freeShippingThreshold')?.value || '100000')
      },
      shipping: {
        standardShippingCost: parseInt(settings.find(s => s.key === 'standardShippingCost')?.value || '5000'),
        expressShippingCost: parseInt(settings.find(s => s.key === 'expressShippingCost')?.value || '15000'),
        internationalShippingCost: parseInt(settings.find(s => s.key === 'internationalShippingCost')?.value || '50000'),
        processingDays: parseInt(settings.find(s => s.key === 'processingDays')?.value || '2')
      },
      payments: {
        razorpayEnabled: settings.find(s => s.key === 'razorpayEnabled')?.value === 'true',
        codEnabled: settings.find(s => s.key === 'codEnabled')?.value !== 'false',
        minimumCodAmount: parseInt(settings.find(s => s.key === 'minimumCodAmount')?.value || '20000')
      }
    };

    return NextResponse.json({ settings: settingsObj });

  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const settingsData = await request.json();

    // Flatten settings object for database storage
    const settingsToUpdate = [
      // General settings
      { key: 'siteName', value: settingsData.general.siteName },
      { key: 'siteDescription', value: settingsData.general.siteDescription },
      { key: 'contactEmail', value: settingsData.general.contactEmail },
      { key: 'supportEmail', value: settingsData.general.supportEmail },
      
      // Commerce settings
      { key: 'currency', value: settingsData.commerce.currency },
      { key: 'taxRate', value: settingsData.commerce.taxRate.toString() },
      { key: 'defaultCommissionRate', value: settingsData.commerce.defaultCommissionRate.toString() },
      { key: 'minimumOrderAmount', value: settingsData.commerce.minimumOrderAmount.toString() },
      { key: 'freeShippingThreshold', value: settingsData.commerce.freeShippingThreshold.toString() },
      
      // Shipping settings
      { key: 'standardShippingCost', value: settingsData.shipping.standardShippingCost.toString() },
      { key: 'expressShippingCost', value: settingsData.shipping.expressShippingCost.toString() },
      { key: 'internationalShippingCost', value: settingsData.shipping.internationalShippingCost.toString() },
      { key: 'processingDays', value: settingsData.shipping.processingDays.toString() },
      
      // Payment settings
      { key: 'razorpayEnabled', value: settingsData.payments.razorpayEnabled.toString() },
      { key: 'codEnabled', value: settingsData.payments.codEnabled.toString() },
      { key: 'minimumCodAmount', value: settingsData.payments.minimumCodAmount.toString() }
    ];

    // Update settings using upsert
    await Promise.all(
      settingsToUpdate.map(setting =>
        prisma.setting.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: { key: setting.key, value: setting.value }
        })
      )
    );

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });

  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
