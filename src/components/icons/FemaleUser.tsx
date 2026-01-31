import { LucideProps } from "lucide-react";

export const FemaleUser = (props: LucideProps) => {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 2a5 5 0 0 1 5 5v2a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z" />
            <path d="M12 14c4 0 7-3 7-3v3c0 3.5-3 6-7 6s-7-2.5-7-6v-3s3 3 7 3z" />
            <path d="M4 22h16" />
        </svg>
    );
};

export const FemaleUserHijab = (props: LucideProps) => {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 2c-3.5 0-6 2.5-6 6 0 2.5 1.5 4.5 4 5.5C7 15 4 18 4 22h16c0-4-3-7-6-8.5 2.5-1 4-3 4-5.5 0-3.5-2.5-6-6-6z" />
            <path d="M12 4a4 4 0 0 0-4 4c0 1.5.8 2.8 2 3.5V14" />
        </svg>
    )
}
