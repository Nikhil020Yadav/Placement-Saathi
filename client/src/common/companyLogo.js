// utils/companyLogo.js
export const getCompanyDomain = (company) => {
    const companyMap = {
        "Amazon": "amazon.com",
        "Microsoft": "microsoft.com",
        "Google": "google.com",
        "Meta": "meta.com",
        "TCS": "tcs.com",
        "Accenture": "accenture.com",
        "Wells Fargo": "wellsfargo.com",
        "Deutsche Bank": "db.com",
        "Cognizant": "cognizant.com",
        // Add more as needed
    };

    const key = company.trim().toLowerCase();
    const matched = Object.keys(companyMap).find(
        name => name.toLowerCase() === key
    );

    return matched ? companyMap[matched] : null;
};
