import { Head, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
export default function ProfileIndex() {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user!;
    return <><Head title="My Profile" /><div style={{background:'#0C0A09',minHeight:'100vh',color:'#FAFAF8',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'0.5rem'}}>
        <div style={{fontFamily:'Fraunces,serif',fontStyle:'italic',fontSize:'2rem',color:'#D97706'}}>@{user.username}</div>
        <div style={{color:'#A8A29E'}}>Profile — coming soon</div>
    </div></>;
}
