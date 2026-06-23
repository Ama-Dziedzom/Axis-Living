import { Metadata } from 'next';
import CancelClient from './CancelClient';

export const metadata: Metadata = {
    title: 'Cancel Booking | NOA Living Studio',
};

export default function CancelPage() {
    return <CancelClient />;
}
