import { Metadata } from 'next';
import CancelClient from './CancelClient';

export const metadata: Metadata = {
    title: 'Cancel Booking | Axis Living',
};

export default function CancelPage() {
    return <CancelClient />;
}
