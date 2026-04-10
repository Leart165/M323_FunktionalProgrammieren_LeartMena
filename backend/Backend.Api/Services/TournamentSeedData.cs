using Backend.Api.DTOs;

namespace Backend.Api.Services;

public static class TournamentSeedData
{
    public static readonly IReadOnlyList<GroupDefinition> GroupDefinitions = BuildGroupDefinitions();
    public static readonly IReadOnlyList<FixtureDefinition> GroupFixtures = BuildGroupFixtures();
    public static readonly IReadOnlyList<KnockoutTemplateDefinition> KnockoutTemplates = BuildKnockoutTemplates();
    public static readonly IReadOnlyDictionary<string, TeamStrengthDto> Strengths = BuildStrengths();

        private static GroupTeamDefinition Team(
            string name,
            string shortName,
            string flagClassName,
            string? tag = null,
            string? tagClassName = null)
        {
            return new GroupTeamDefinition(name, shortName, flagClassName, tag, tagClassName);
        }
    
        private static IReadOnlyList<GroupDefinition> BuildGroupDefinitions()
        {
            return
            [
                new GroupDefinition("A", "Mexico City Stadium • Estadio Guadalajara • Atlanta Stadium • Estadio Monterrey",
                [
                    Team("Mexico", "MEX", "bg-green-700", "HOST", "text-brand-gold font-black"),
                    Team("South Korea", "KOR", "bg-red-700"),
                    Team("South Africa", "RSA", "bg-green-600"),
                    Team("Czechia", "CZE", "bg-white border border-gray-300"),
                ]),
                new GroupDefinition("B", "Toronto Stadium • San Francisco Bay Area Stadium • Los Angeles Stadium • BC Place Vancouver • Seattle Stadium",
                [
                    Team("Canada", "CAN", "bg-red-700", "HOST", "text-brand-gold font-black"),
                    Team("Switzerland", "SUI", "bg-red-700"),
                    Team("Qatar", "QAT", "bg-red-900"),
                    Team("Bosnia and Herzegovina", "BIH", "bg-blue-700"),
                ]),
                new GroupDefinition("C", "New York New Jersey Stadium • Boston Stadium • Philadelphia Stadium • Miami Stadium • Atlanta Stadium",
                [
                    Team("Brazil", "BRA", "bg-green-600"),
                    Team("Morocco", "MAR", "bg-red-800"),
                    Team("Scotland", "SCO", "bg-blue-700"),
                    Team("Haiti", "HAI", "bg-blue-600"),
                ]),
                new GroupDefinition("D", "Los Angeles Stadium • BC Place Vancouver • San Francisco Bay Area Stadium • Seattle Stadium",
                [
                    Team("USA", "USA", "bg-blue-900", "HOST", "text-brand-gold font-black"),
                    Team("Paraguay", "PAR", "bg-red-700"),
                    Team("Australia", "AUS", "bg-yellow-500"),
                    Team("Türkiye", "TUR", "bg-red-700"),
                ]),
                new GroupDefinition("E", "Philadelphia Stadium • Houston Stadium • Toronto Stadium • Kansas City Stadium • New York New Jersey Stadium",
                [
                    Team("Germany", "GER", "bg-gray-900"),
                    Team("Ecuador", "ECU", "bg-yellow-400"),
                    Team("Ivory Coast", "CIV", "bg-orange-500"),
                    Team("Curaçao", "CUW", "bg-blue-600"),
                ]),
                new GroupDefinition("F", "Dallas Stadium • Estadio Monterrey • Houston Stadium • Kansas City Stadium",
                [
                    Team("Netherlands", "NED", "bg-orange-500"),
                    Team("Japan", "JPN", "bg-white border border-gray-300"),
                    Team("Tunisia", "TUN", "bg-red-600"),
                    Team("Sweden", "SWE", "bg-yellow-500"),
                ]),
                new GroupDefinition("G", "Los Angeles Stadium • Seattle Stadium • BC Place Vancouver",
                [
                    Team("Belgium", "BEL", "bg-red-700"),
                    Team("Iran", "IRN", "bg-green-700"),
                    Team("Egypt", "EGY", "bg-red-700"),
                    Team("New Zealand", "NZL", "bg-black"),
                ]),
                new GroupDefinition("H", "Miami Stadium • Atlanta Stadium • Houston Stadium • Estadio Guadalajara",
                [
                    Team("Spain", "ESP", "bg-yellow-600"),
                    Team("Uruguay", "URU", "bg-sky-400"),
                    Team("Saudi Arabia", "KSA", "bg-green-700"),
                    Team("Cape Verde", "CPV", "bg-blue-700"),
                ]),
                new GroupDefinition("I", "New York New Jersey Stadium • Boston Stadium • Philadelphia Stadium • Toronto Stadium",
                [
                    Team("France", "FRA", "bg-blue-700"),
                    Team("Senegal", "SEN", "bg-green-700"),
                    Team("Norway", "NOR", "bg-red-700"),
                    Team("Iraq", "IRQ", "bg-red-700"),
                ]),
                new GroupDefinition("J", "Kansas City Stadium • San Francisco Bay Area Stadium • Dallas Stadium",
                [
                    Team("Argentina", "ARG", "bg-sky-400"),
                    Team("Austria", "AUT", "bg-red-700"),
                    Team("Algeria", "ALG", "bg-green-700"),
                    Team("Jordan", "JOR", "bg-red-700"),
                ]),
                new GroupDefinition("K", "Houston Stadium • Mexico City Stadium • Estadio Guadalajara • Miami Stadium • Atlanta Stadium",
                [
                    Team("Portugal", "POR", "bg-green-700"),
                    Team("Colombia", "COL", "bg-yellow-500"),
                    Team("Uzbekistan", "UZB", "bg-blue-500"),
                    Team("DR Congo", "COD", "bg-blue-600"),
                ]),
                new GroupDefinition("L", "Toronto Stadium • Dallas Stadium • Boston Stadium • New York New Jersey Stadium • Philadelphia Stadium",
                [
                    Team("England", "ENG", "bg-white border border-gray-300"),
                    Team("Croatia", "CRO", "bg-red-600"),
                    Team("Panama", "PAN", "bg-red-700"),
                    Team("Ghana", "GHA", "bg-yellow-500"),
                ]),
            ];
        }
    
        private static IReadOnlyList<FixtureDefinition> BuildGroupFixtures()
        {
            return
            [
                new FixtureDefinition("A-1", "A", 1, "Matchday 1", "Thu, Jun 11, 2026", "Mexico City Stadium", "Mexico", "South Africa"),
                new FixtureDefinition("A-2", "A", 2, "Matchday 1", "Thu, Jun 11, 2026", "Estadio Guadalajara", "South Korea", "Czechia"),
                new FixtureDefinition("A-3", "A", 25, "Matchday 2", "Thu, Jun 18, 2026", "Atlanta Stadium", "Czechia", "South Africa"),
                new FixtureDefinition("A-4", "A", 28, "Matchday 2", "Thu, Jun 18, 2026", "Estadio Guadalajara", "Mexico", "South Korea"),
                new FixtureDefinition("A-5", "A", 53, "Matchday 3", "Wed, Jun 24, 2026", "Mexico City Stadium", "Czechia", "Mexico"),
                new FixtureDefinition("A-6", "A", 54, "Matchday 3", "Wed, Jun 24, 2026", "Estadio Monterrey", "South Africa", "South Korea"),
    
                new FixtureDefinition("B-1", "B", 3, "Matchday 1", "Fri, Jun 12, 2026", "Toronto Stadium", "Canada", "Bosnia and Herzegovina"),
                new FixtureDefinition("B-2", "B", 8, "Matchday 1", "Sat, Jun 13, 2026", "San Francisco Bay Area Stadium", "Qatar", "Switzerland"),
                new FixtureDefinition("B-3", "B", 26, "Matchday 2", "Thu, Jun 18, 2026", "Los Angeles Stadium", "Switzerland", "Bosnia and Herzegovina"),
                new FixtureDefinition("B-4", "B", 27, "Matchday 2", "Thu, Jun 18, 2026", "BC Place Vancouver", "Canada", "Qatar"),
                new FixtureDefinition("B-5", "B", 51, "Matchday 3", "Wed, Jun 24, 2026", "BC Place Vancouver", "Switzerland", "Canada"),
                new FixtureDefinition("B-6", "B", 52, "Matchday 3", "Wed, Jun 24, 2026", "Seattle Stadium", "Bosnia and Herzegovina", "Qatar"),
    
                new FixtureDefinition("C-1", "C", 5, "Matchday 1", "Sat, Jun 13, 2026", "Boston Stadium", "Haiti", "Scotland"),
                new FixtureDefinition("C-2", "C", 7, "Matchday 1", "Sat, Jun 13, 2026", "New York New Jersey Stadium", "Brazil", "Morocco"),
                new FixtureDefinition("C-3", "C", 29, "Matchday 2", "Fri, Jun 19, 2026", "Philadelphia Stadium", "Brazil", "Haiti"),
                new FixtureDefinition("C-4", "C", 30, "Matchday 2", "Fri, Jun 19, 2026", "Boston Stadium", "Scotland", "Morocco"),
                new FixtureDefinition("C-5", "C", 49, "Matchday 3", "Wed, Jun 24, 2026", "Miami Stadium", "Scotland", "Brazil"),
                new FixtureDefinition("C-6", "C", 50, "Matchday 3", "Wed, Jun 24, 2026", "Atlanta Stadium", "Morocco", "Haiti"),
    
                new FixtureDefinition("D-1", "D", 4, "Matchday 1", "Fri, Jun 12, 2026", "Los Angeles Stadium", "USA", "Paraguay"),
                new FixtureDefinition("D-2", "D", 6, "Matchday 1", "Sat, Jun 13, 2026", "BC Place Vancouver", "Australia", "Türkiye"),
                new FixtureDefinition("D-3", "D", 31, "Matchday 2", "Fri, Jun 19, 2026", "San Francisco Bay Area Stadium", "Türkiye", "Paraguay"),
                new FixtureDefinition("D-4", "D", 32, "Matchday 2", "Fri, Jun 19, 2026", "Seattle Stadium", "USA", "Australia"),
                new FixtureDefinition("D-5", "D", 59, "Matchday 3", "Thu, Jun 25, 2026", "Los Angeles Stadium", "Türkiye", "USA"),
                new FixtureDefinition("D-6", "D", 60, "Matchday 3", "Thu, Jun 25, 2026", "San Francisco Bay Area Stadium", "Paraguay", "Australia"),
    
                new FixtureDefinition("E-1", "E", 9, "Matchday 1", "Sun, Jun 14, 2026", "Philadelphia Stadium", "Ivory Coast", "Ecuador"),
                new FixtureDefinition("E-2", "E", 10, "Matchday 1", "Sun, Jun 14, 2026", "Houston Stadium", "Germany", "Curaçao"),
                new FixtureDefinition("E-3", "E", 33, "Matchday 2", "Sat, Jun 20, 2026", "Toronto Stadium", "Germany", "Ivory Coast"),
                new FixtureDefinition("E-4", "E", 34, "Matchday 2", "Sat, Jun 20, 2026", "Kansas City Stadium", "Ecuador", "Curaçao"),
                new FixtureDefinition("E-5", "E", 55, "Matchday 3", "Thu, Jun 25, 2026", "Philadelphia Stadium", "Curaçao", "Ivory Coast"),
                new FixtureDefinition("E-6", "E", 56, "Matchday 3", "Thu, Jun 25, 2026", "New York New Jersey Stadium", "Ecuador", "Germany"),
    
                new FixtureDefinition("F-1", "F", 11, "Matchday 1", "Sun, Jun 14, 2026", "Dallas Stadium", "Netherlands", "Japan"),
                new FixtureDefinition("F-2", "F", 12, "Matchday 1", "Sun, Jun 14, 2026", "Estadio Monterrey", "Sweden", "Tunisia"),
                new FixtureDefinition("F-3", "F", 35, "Matchday 2", "Sat, Jun 20, 2026", "Houston Stadium", "Netherlands", "Sweden"),
                new FixtureDefinition("F-4", "F", 36, "Matchday 2", "Sat, Jun 20, 2026", "Estadio Monterrey", "Tunisia", "Japan"),
                new FixtureDefinition("F-5", "F", 57, "Matchday 3", "Thu, Jun 25, 2026", "Dallas Stadium", "Japan", "Sweden"),
                new FixtureDefinition("F-6", "F", 58, "Matchday 3", "Thu, Jun 25, 2026", "Kansas City Stadium", "Tunisia", "Netherlands"),
    
                new FixtureDefinition("G-1", "G", 15, "Matchday 1", "Mon, Jun 15, 2026", "Los Angeles Stadium", "Iran", "New Zealand"),
                new FixtureDefinition("G-2", "G", 16, "Matchday 1", "Mon, Jun 15, 2026", "Seattle Stadium", "Belgium", "Egypt"),
                new FixtureDefinition("G-3", "G", 39, "Matchday 2", "Sun, Jun 21, 2026", "Los Angeles Stadium", "Belgium", "Iran"),
                new FixtureDefinition("G-4", "G", 40, "Matchday 2", "Sun, Jun 21, 2026", "BC Place Vancouver", "New Zealand", "Egypt"),
                new FixtureDefinition("G-5", "G", 63, "Matchday 3", "Fri, Jun 26, 2026", "Seattle Stadium", "Egypt", "Iran"),
                new FixtureDefinition("G-6", "G", 64, "Matchday 3", "Fri, Jun 26, 2026", "BC Place Vancouver", "New Zealand", "Belgium"),
    
                new FixtureDefinition("H-1", "H", 13, "Matchday 1", "Mon, Jun 15, 2026", "Miami Stadium", "Saudi Arabia", "Uruguay"),
                new FixtureDefinition("H-2", "H", 14, "Matchday 1", "Mon, Jun 15, 2026", "Atlanta Stadium", "Spain", "Cape Verde"),
                new FixtureDefinition("H-3", "H", 37, "Matchday 2", "Sun, Jun 21, 2026", "Miami Stadium", "Uruguay", "Cape Verde"),
                new FixtureDefinition("H-4", "H", 38, "Matchday 2", "Sun, Jun 21, 2026", "Atlanta Stadium", "Spain", "Saudi Arabia"),
                new FixtureDefinition("H-5", "H", 65, "Matchday 3", "Fri, Jun 26, 2026", "Houston Stadium", "Cape Verde", "Saudi Arabia"),
                new FixtureDefinition("H-6", "H", 66, "Matchday 3", "Fri, Jun 26, 2026", "Estadio Guadalajara", "Uruguay", "Spain"),
    
                new FixtureDefinition("I-1", "I", 17, "Matchday 1", "Tue, Jun 16, 2026", "New York New Jersey Stadium", "France", "Senegal"),
                new FixtureDefinition("I-2", "I", 18, "Matchday 1", "Tue, Jun 16, 2026", "Boston Stadium", "Iraq", "Norway"),
                new FixtureDefinition("I-3", "I", 41, "Matchday 2", "Mon, Jun 22, 2026", "New York New Jersey Stadium", "Norway", "Senegal"),
                new FixtureDefinition("I-4", "I", 42, "Matchday 2", "Mon, Jun 22, 2026", "Philadelphia Stadium", "France", "Iraq"),
                new FixtureDefinition("I-5", "I", 61, "Matchday 3", "Fri, Jun 26, 2026", "Boston Stadium", "Norway", "France"),
                new FixtureDefinition("I-6", "I", 62, "Matchday 3", "Fri, Jun 26, 2026", "Toronto Stadium", "Senegal", "Iraq"),
    
                new FixtureDefinition("J-1", "J", 19, "Matchday 1", "Tue, Jun 16, 2026", "Kansas City Stadium", "Argentina", "Algeria"),
                new FixtureDefinition("J-2", "J", 20, "Matchday 1", "Tue, Jun 16, 2026", "San Francisco Bay Area Stadium", "Austria", "Jordan"),
                new FixtureDefinition("J-3", "J", 43, "Matchday 2", "Mon, Jun 22, 2026", "Dallas Stadium", "Argentina", "Austria"),
                new FixtureDefinition("J-4", "J", 44, "Matchday 2", "Mon, Jun 22, 2026", "San Francisco Bay Area Stadium", "Jordan", "Algeria"),
                new FixtureDefinition("J-5", "J", 69, "Matchday 3", "Sat, Jun 27, 2026", "Kansas City Stadium", "Algeria", "Austria"),
                new FixtureDefinition("J-6", "J", 70, "Matchday 3", "Sat, Jun 27, 2026", "Dallas Stadium", "Jordan", "Argentina"),
    
                new FixtureDefinition("K-1", "K", 23, "Matchday 1", "Wed, Jun 17, 2026", "Houston Stadium", "Portugal", "DR Congo"),
                new FixtureDefinition("K-2", "K", 24, "Matchday 1", "Wed, Jun 17, 2026", "Mexico City Stadium", "Uzbekistan", "Colombia"),
                new FixtureDefinition("K-3", "K", 47, "Matchday 2", "Tue, Jun 23, 2026", "Houston Stadium", "Portugal", "Uzbekistan"),
                new FixtureDefinition("K-4", "K", 48, "Matchday 2", "Tue, Jun 23, 2026", "Estadio Guadalajara", "Colombia", "DR Congo"),
                new FixtureDefinition("K-5", "K", 71, "Matchday 3", "Sat, Jun 27, 2026", "Miami Stadium", "Colombia", "Portugal"),
                new FixtureDefinition("K-6", "K", 72, "Matchday 3", "Sat, Jun 27, 2026", "Atlanta Stadium", "DR Congo", "Uzbekistan"),
    
                new FixtureDefinition("L-1", "L", 21, "Matchday 1", "Wed, Jun 17, 2026", "Toronto Stadium", "Ghana", "Panama"),
                new FixtureDefinition("L-2", "L", 22, "Matchday 1", "Wed, Jun 17, 2026", "Dallas Stadium", "England", "Croatia"),
                new FixtureDefinition("L-3", "L", 45, "Matchday 2", "Tue, Jun 23, 2026", "Boston Stadium", "England", "Ghana"),
                new FixtureDefinition("L-4", "L", 46, "Matchday 2", "Tue, Jun 23, 2026", "Toronto Stadium", "Panama", "Croatia"),
                new FixtureDefinition("L-5", "L", 67, "Matchday 3", "Sat, Jun 27, 2026", "New York New Jersey Stadium", "Panama", "England"),
                new FixtureDefinition("L-6", "L", 68, "Matchday 3", "Sat, Jun 27, 2026", "Philadelphia Stadium", "Croatia", "Ghana"),
            ];
        }
    
        private static IReadOnlyList<KnockoutTemplateDefinition> BuildKnockoutTemplates()
        {
            return
            [
                new KnockoutTemplateDefinition("M73", "Round of 32", "Round of 32", "Sun, Jun 28, 2026", "Los Angeles Stadium", "2nd Group A", "2nd Group B"),
                new KnockoutTemplateDefinition("M74", "Round of 32", "Round of 32", "Mon, Jun 29, 2026", "Boston Stadium", "1st Group E", "3rd Group A/B/C/D/F"),
                new KnockoutTemplateDefinition("M75", "Round of 32", "Round of 32", "Mon, Jun 29, 2026", "Estadio Monterrey", "1st Group F", "2nd Group C"),
                new KnockoutTemplateDefinition("M76", "Round of 32", "Round of 32", "Mon, Jun 29, 2026", "Houston Stadium", "1st Group C", "2nd Group F"),
                new KnockoutTemplateDefinition("M77", "Round of 32", "Round of 32", "Tue, Jun 30, 2026", "New York New Jersey Stadium", "1st Group I", "3rd Group C/D/F/G/H"),
                new KnockoutTemplateDefinition("M78", "Round of 32", "Round of 32", "Tue, Jun 30, 2026", "Dallas Stadium", "2nd Group E", "2nd Group I"),
                new KnockoutTemplateDefinition("M79", "Round of 32", "Round of 32", "Tue, Jun 30, 2026", "Mexico City Stadium", "1st Group A", "3rd Group C/E/F/H/I"),
                new KnockoutTemplateDefinition("M80", "Round of 32", "Round of 32", "Wed, Jul 1, 2026", "Atlanta Stadium", "1st Group L", "3rd Group E/H/I/J/K"),
                new KnockoutTemplateDefinition("M81", "Round of 32", "Round of 32", "Wed, Jul 1, 2026", "San Francisco Bay Area Stadium", "1st Group D", "3rd Group B/E/F/I/J"),
                new KnockoutTemplateDefinition("M82", "Round of 32", "Round of 32", "Wed, Jul 1, 2026", "Seattle Stadium", "1st Group G", "3rd Group A/E/H/I/J"),
                new KnockoutTemplateDefinition("M83", "Round of 32", "Round of 32", "Thu, Jul 2, 2026", "Toronto Stadium", "2nd Group K", "2nd Group L"),
                new KnockoutTemplateDefinition("M84", "Round of 32", "Round of 32", "Thu, Jul 2, 2026", "Los Angeles Stadium", "1st Group H", "2nd Group J"),
                new KnockoutTemplateDefinition("M85", "Round of 32", "Round of 32", "Thu, Jul 2, 2026", "BC Place Vancouver", "1st Group B", "3rd Group E/F/G/I/J"),
                new KnockoutTemplateDefinition("M86", "Round of 32", "Round of 32", "Fri, Jul 3, 2026", "Miami Stadium", "1st Group J", "2nd Group H"),
                new KnockoutTemplateDefinition("M87", "Round of 32", "Round of 32", "Fri, Jul 3, 2026", "Kansas City Stadium", "1st Group K", "3rd Group D/E/I/J/L"),
                new KnockoutTemplateDefinition("M88", "Round of 32", "Round of 32", "Fri, Jul 3, 2026", "Dallas Stadium", "2nd Group D", "2nd Group G"),
                new KnockoutTemplateDefinition("M89", "Round of 16", "Round of 16", "Sat, Jul 4, 2026", "Philadelphia Stadium", "Winner M74", "Winner M77"),
                new KnockoutTemplateDefinition("M90", "Round of 16", "Round of 16", "Sat, Jul 4, 2026", "Houston Stadium", "Winner M73", "Winner M75"),
                new KnockoutTemplateDefinition("M91", "Round of 16", "Round of 16", "Sun, Jul 5, 2026", "New York New Jersey Stadium", "Winner M76", "Winner M78"),
                new KnockoutTemplateDefinition("M92", "Round of 16", "Round of 16", "Sun, Jul 5, 2026", "Mexico City Stadium", "Winner M79", "Winner M80"),
                new KnockoutTemplateDefinition("M93", "Round of 16", "Round of 16", "Mon, Jul 6, 2026", "Dallas Stadium", "Winner M83", "Winner M84"),
                new KnockoutTemplateDefinition("M94", "Round of 16", "Round of 16", "Mon, Jul 6, 2026", "Seattle Stadium", "Winner M81", "Winner M82"),
                new KnockoutTemplateDefinition("M95", "Round of 16", "Round of 16", "Tue, Jul 7, 2026", "Atlanta Stadium", "Winner M86", "Winner M88"),
                new KnockoutTemplateDefinition("M96", "Round of 16", "Round of 16", "Tue, Jul 7, 2026", "BC Place Vancouver", "Winner M85", "Winner M87"),
                new KnockoutTemplateDefinition("M97", "Quarter-finals", "Quarter-final", "Thu, Jul 9, 2026", "Boston Stadium", "Winner M89", "Winner M90"),
                new KnockoutTemplateDefinition("M98", "Quarter-finals", "Quarter-final", "Fri, Jul 10, 2026", "Los Angeles Stadium", "Winner M93", "Winner M94"),
                new KnockoutTemplateDefinition("M99", "Quarter-finals", "Quarter-final", "Sat, Jul 11, 2026", "Miami Stadium", "Winner M91", "Winner M92"),
                new KnockoutTemplateDefinition("M100", "Quarter-finals", "Quarter-final", "Sat, Jul 11, 2026", "Kansas City Stadium", "Winner M95", "Winner M96"),
                new KnockoutTemplateDefinition("M101", "Semi-finals", "Semi-final", "Tue, Jul 14, 2026", "Dallas Stadium", "Winner M97", "Winner M98"),
                new KnockoutTemplateDefinition("M102", "Semi-finals", "Semi-final", "Wed, Jul 15, 2026", "Atlanta Stadium", "Winner M99", "Winner M100"),
                new KnockoutTemplateDefinition("M103", "Final Stage", "Bronze Final", "Sat, Jul 18, 2026", "Miami Stadium", "Runner-up M101", "Runner-up M102"),
                new KnockoutTemplateDefinition("M104", "Final Stage", "Final", "Sun, Jul 19, 2026", "New York New Jersey Stadium", "Winner M101", "Winner M102"),
            ];
        }
    
        private static IReadOnlyDictionary<string, TeamStrengthDto> BuildStrengths()
        {
            return new Dictionary<string, TeamStrengthDto>(StringComparer.OrdinalIgnoreCase)
            {
                ["Argentina"] = new("Argentina", 2040),
                ["Australia"] = new("Australia", 1810),
                ["Algeria"] = new("Algeria", 1835),
                ["Austria"] = new("Austria", 1885),
                ["Belgium"] = new("Belgium", 1930),
                ["Bosnia and Herzegovina"] = new("Bosnia and Herzegovina", 1765),
                ["Brazil"] = new("Brazil", 2060),
                ["Canada"] = new("Canada", 1820),
                ["Cape Verde"] = new("Cape Verde", 1740),
                ["Colombia"] = new("Colombia", 1915),
                ["Croatia"] = new("Croatia", 1910),
                ["Curaçao"] = new("Curaçao", 1690),
                ["Czechia"] = new("Czechia", 1825),
                ["DR Congo"] = new("DR Congo", 1735),
                ["Ecuador"] = new("Ecuador", 1840),
                ["Egypt"] = new("Egypt", 1795),
                ["England"] = new("England", 2025),
                ["France"] = new("France", 2045),
                ["Germany"] = new("Germany", 1980),
                ["Ghana"] = new("Ghana", 1770),
                ["Haiti"] = new("Haiti", 1660),
                ["Iran"] = new("Iran", 1855),
                ["Iraq"] = new("Iraq", 1710),
                ["Ivory Coast"] = new("Ivory Coast", 1845),
                ["Japan"] = new("Japan", 1910),
                ["Jordan"] = new("Jordan", 1700),
                ["Mexico"] = new("Mexico", 1880),
                ["Morocco"] = new("Morocco", 1940),
                ["Netherlands"] = new("Netherlands", 1995),
                ["New Zealand"] = new("New Zealand", 1675),
                ["Norway"] = new("Norway", 1840),
                ["Panama"] = new("Panama", 1725),
                ["Paraguay"] = new("Paraguay", 1805),
                ["Portugal"] = new("Portugal", 2015),
                ["Qatar"] = new("Qatar", 1730),
                ["Saudi Arabia"] = new("Saudi Arabia", 1745),
                ["Scotland"] = new("Scotland", 1815),
                ["Senegal"] = new("Senegal", 1895),
                ["South Africa"] = new("South Africa", 1705),
                ["South Korea"] = new("South Korea", 1860),
                ["Spain"] = new("Spain", 2035),
                ["Sweden"] = new("Sweden", 1845),
                ["Switzerland"] = new("Switzerland", 1999),
                ["Tunisia"] = new("Tunisia", 1760),
                ["Türkiye"] = new("Türkiye", 1865),
                ["Uruguay"] = new("Uruguay", 1960),
                ["USA"] = new("USA", 1860),
                ["Uzbekistan"] = new("Uzbekistan", 1720),
            };
        }
}
