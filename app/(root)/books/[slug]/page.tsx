import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getBookBySlug } from '@/lib/actions/book.actions';
import VapiControls from '@/components/vapi-controls';


const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { userId } = await auth();
  
    if (!userId) {
      redirect('/');
    }
 
    const { slug } = await params; 
    const data = await getBookBySlug(slug);

    if(!data?.success || !data?.book) { 
        redirect('/')
    }
    const result = data.book;
    console.log(data.book)


    return (
        <div className="wrapper">
          <Link href="/" className="back-btn-floating">
            <ArrowLeft className="w-5 h-5 text-(--text-primary)" />
          </Link>
     
        <VapiControls book={result}/>
        </div>
      );
    }
     
export default Page