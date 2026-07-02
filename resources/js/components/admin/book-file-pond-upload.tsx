import { useMemo, useState } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import type { FilePondFile } from 'filepond';

import { Label } from '@/components/ui/label';

import 'filepond/dist/filepond.min.css';

registerPlugin(FilePondPluginFileValidateType);

const ACCEPTED_FILE_TYPES = [
    'application/pdf',
    'application/epub+zip',
    'application/epub',
    'application/x-epub+zip',
];

type BookFilePondUploadProps = {
    inputId?: string;
    existingFileType?: string | null;
    existingFilePath?: string | null;
    error?: string;
    onFileChange?: (file: File | null) => void;
};

function BookFilePondUpload({
    inputId = 'book-file',
    existingFileType,
    existingFilePath,
    error,
    onFileChange,
}: BookFilePondUploadProps) {
    const [files, setFiles] = useState<FilePondFile[]>([]);

    const existingFileLabel = useMemo(() => {
        if (existingFilePath) {
            return existingFilePath.split('/').pop() ?? null;
        }

        return existingFileType ? existingFileType.toUpperCase() : null;
    }, [existingFilePath, existingFileType]);

    function handleUpdateFiles(fileItems: FilePondFile[]) {
        setFiles(fileItems);
        const file = fileItems[0]?.file;

        onFileChange?.(file instanceof File ? file : null);
    }

    return (
        <div className="space-y-2">
            <Label htmlFor={inputId}>Book file</Label>
            {existingFileLabel ? (
                <p className="text-sm text-muted-foreground">
                    Current file:{' '}
                    <span className="font-medium text-foreground">
                        {existingFileLabel}
                    </span>
                    . Upload a new PDF or EPUB to replace it.
                </p>
            ) : (
                <p className="text-sm text-muted-foreground">
                    Upload a PDF or EPUB file for this book.
                </p>
            )}
            <FilePond
                id={inputId}
                files={files}
                onupdatefiles={handleUpdateFiles}
                allowMultiple={false}
                allowProcess={false}
                instantUpload={false}
                maxFiles={1}
                credits={false}
                acceptedFileTypes={ACCEPTED_FILE_TYPES}
                labelIdle='Drag & drop your book file or <span class="filepond--label-action">Browse</span>'
                labelFileTypeNotAllowed="Only PDF and EPUB files are allowed"
                fileValidateTypeLabelExpectedTypes="Expects PDF or EPUB"
            />
            {error ? (
                <p className="text-sm text-destructive">{error}</p>
            ) : null}
        </div>
    );
}

export { BookFilePondUpload };
