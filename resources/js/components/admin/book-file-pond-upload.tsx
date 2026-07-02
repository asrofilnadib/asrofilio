import { useMemo, useState } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import type { FilePondFile, FilePondOptions } from 'filepond';

import { Label } from '@/components/ui/label';
import { getCsrfToken } from '@/lib/csrf';
import { paths } from '@/lib/paths';

import 'filepond/dist/filepond.min.css';

registerPlugin(FilePondPluginFileValidateType);

const ACCEPTED_FILE_TYPES = [
    'application/pdf',
    'application/epub+zip',
    'application/epub',
    'application/x-epub+zip',
];

const uploadHeaders = () => ({
    'X-CSRF-TOKEN': getCsrfToken(),
    Accept: 'text/plain',
    'X-Requested-With': 'XMLHttpRequest',
});

const bookFileServer: FilePondOptions['server'] = {
    process: {
        url: paths.admin.bookUploadProcess,
        method: 'POST',
        headers: uploadHeaders(),
        onload: (response) => response,
        onerror: (response) => response,
    },
    revert: {
        url: paths.admin.bookUploadRevert,
        method: 'DELETE',
        headers: uploadHeaders(),
    },
};

type BookFilePondUploadProps = {
    inputId?: string;
    existingFileType?: string | null;
    existingFilePath?: string | null;
    error?: string;
    onStagedUploadChange?: (uploadId: string | null) => void;
    onUploadingChange?: (uploading: boolean) => void;
};

function BookFilePondUpload({
    inputId = 'book-file',
    existingFileType,
    existingFilePath,
    error,
    onStagedUploadChange,
    onUploadingChange,
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

        if (fileItems.length === 0) {
            onStagedUploadChange?.(null);
        }
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
                name="file"
                files={files}
                onupdatefiles={handleUpdateFiles}
                server={bookFileServer}
                allowMultiple={false}
                instantUpload
                maxFiles={1}
                credits={false}
                acceptedFileTypes={ACCEPTED_FILE_TYPES}
                labelIdle='Drag & drop your book file or <span class="filepond--label-action">Browse</span>'
                labelFileProcessing="Uploading"
                labelFileProcessingComplete="Upload complete"
                labelFileProcessingAborted="Upload cancelled"
                labelFileProcessingError="Error during upload"
                labelTapToCancel="tap to cancel"
                labelTapToUndo="tap to undo"
                labelFileTypeNotAllowed="Only PDF and EPUB files are allowed"
                fileValidateTypeLabelExpectedTypes="Expects PDF or EPUB"
                onprocessfilestart={() => onUploadingChange?.(true)}
                onprocessfile={(processError, file) => {
                    onUploadingChange?.(false);

                    if (!processError && file.serverId) {
                        onStagedUploadChange?.(file.serverId);
                    }
                }}
                onprocessfileabort={() => {
                    onUploadingChange?.(false);
                    onStagedUploadChange?.(null);
                }}
                onerror={() => {
                    onUploadingChange?.(false);
                    onStagedUploadChange?.(null);
                }}
                onremovefile={() => onStagedUploadChange?.(null)}
            />
            {error ? (
                <p className="text-sm text-destructive">{error}</p>
            ) : null}
        </div>
    );
}

export { BookFilePondUpload };
