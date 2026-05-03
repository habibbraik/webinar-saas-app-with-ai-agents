import { Badge } from '@/components/ui/badge'
import PageHeader from '@/components/ui/ReuseableComponents/PageHeader'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileText, HomeIcon, WebcamIcon } from 'lucide-react'
import React from 'react'
import { leadData } from './_data'

type Props = {}

const page = (props: Props) => {
    return (
        <div className='w-full flex flex-col gap-8'>
            <PageHeader
                leftIcon={<HomeIcon className='w-3 h-3' />}
                mainIcon={<WebcamIcon className='w-12 h-12' />}
                rightIcon={<FileText className='w-4 h-4' />}
                heading='The home to all your customers'
                placeholder='Search Customer...'
            />
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-sm text-muted-foreground">
                            Name
                        </TableHead>
                        <TableHead className="text-sm text-muted-foreground">
                            Email
                        </TableHead>
                        <TableHead className="text-sm text-muted-foreground">
                            Phone
                        </TableHead>
                        <TableHead className="text-sm text-muted-foreground">
                            Tags
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {leadData?.map((lead, idx) => (
                        <TableRow key={idx} className="border-0">
                            <TableCell className="font-medium">{lead?.name}</TableCell>
                            <TableCell>{lead?.email}</TableCell>
                            <TableCell>{lead?.phone}</TableCell>
                            <TableCell className="text-right">
                                {lead?.tags?.map((tag, idx) => (
                                    <Badge
                                        key={idx}
                                        variant="outline"
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default page