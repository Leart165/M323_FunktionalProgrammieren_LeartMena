import { type JSX } from "react";

const COUNTRY_FLAG_MAP: Record<string, string> = {
    algeria: "🇩🇿",
    argentina: "🇦🇷",
    austria: "🇦🇹",
    belgium: "🇧🇪",
    "bosnia and herzegovina": "🇧🇦",
    brazil: "🇧🇷",
    cameroon: "🇨🇲",
    canada: "🇨🇦",
    "cape verde": "🇨🇻",
    colombia: "🇨🇴",
    "costa rica": "🇨🇷",
    croatia: "🇭🇷",
    curacao: "🇨🇼",
    "curaçao": "🇨🇼",
    czechia: "🇨🇿",
    denmark: "🇩🇰",
    "dr congo": "🇨🇩",
    ecuador: "🇪🇨",
    egypt: "🇪🇬",
    england: "🏴",
    france: "🇫🇷",
    germany: "🇩🇪",
    ghana: "🇬🇭",
    haiti: "🇭🇹",
    honduras: "🇭🇳",
    iran: "🇮🇷",
    iraq: "🇮🇶",
    "ivory coast": "🇨🇮",
    jamaica: "🇯🇲",
    japan: "🇯🇵",
    jordan: "🇯🇴",
    mexico: "🇲🇽",
    morocco: "🇲🇦",
    netherlands: "🇳🇱",
    nigeria: "🇳🇬",
    "new zealand": "🇳🇿",
    norway: "🇳🇴",
    paraguay: "🇵🇾",
    peru: "🇵🇪",
    poland: "🇵🇱",
    portugal: "🇵🇹",
    qatar: "🇶🇦",
    "saudi arabia": "🇸🇦",
    scotland: "🏴",
    senegal: "🇸🇳",
    serbia: "🇷🇸",
    "south africa": "🇿🇦",
    "south korea": "🇰🇷",
    spain: "🇪🇸",
    sweden: "🇸🇪",
    switzerland: "🇨🇭",
    turkey: "🇹🇷",
    tunisia: "🇹🇳",
    turkiye: "🇹🇷",
    ukraine: "🇺🇦",
    uruguay: "🇺🇾",
    usa: "🇺🇸",
    "united states": "🇺🇸",
    uzbekistan: "🇺🇿",
    wales: "🏴",
};

function normalizeCountryName(name: string): string {
    return name
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

export function getCountryFlag(name: string): string {
    return COUNTRY_FLAG_MAP[normalizeCountryName(name)] ?? "🏳️";
}

interface CountryFlagProps {
    countryName: string;
    className?: string;
}

export default function CountryFlag({ countryName, className = "" }: CountryFlagProps): JSX.Element {
    return (
        <span
            aria-label={`${countryName} flag`}
            className={`inline-flex items-center justify-center rounded-sm border border-white/10 bg-white/5 text-xs leading-none ${className}`.trim()}
            role="img"
            title={countryName}
        >
            {getCountryFlag(countryName)}
        </span>
    );
}
