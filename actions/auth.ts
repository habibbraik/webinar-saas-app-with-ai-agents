'use server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prismaClient';

export async function onAuthenticateUser() {
   try {
     const user = await currentUser();
    if (!user) {
        return{
            status:403,
            message:"User not authenticated"
        }
    }   
    const userExists = await prisma.user.findUnique({
        where: { clerkId: user.id },
    });

    if (userExists) {
     return{
        status:200,
        message:"User already exists",
        user: userExists
     }
    }

      const newUser= await prisma.user.create({
            data: {
                clerkId: user.id,
                email: user.emailAddresses[0]?.emailAddress || '',
                name: user.firstName+ ' '+ user.lastName || '',
                profileImage: user.imageUrl || '',
            },
        });
    

    if(!newUser){
        return{
            status:500,
            message:"Error creating user"
        }
    }

    return{
        status:201,
        message:"User created successfully",
        user: newUser
    }
   } catch (error) {
     console.log('Error in onAuthenticateUser:', error);
     return{
        status:500,
        message:"Internal Server Error"
     }
   }
}

