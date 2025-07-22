export const fetchCompanyLogo = async (companyName) => {
    try {
        const response = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${companyName}`);
        const data = await response.json();

        if (data && data.length > 0) {
            const { domain, logo } = data[0];
            return {
                domain,
                logoUrl: logo || `https://logo.clearbit.com/${domain}`
            };
        } else {
            return {
                domain: null,
                logoUrl: null
            };
        }
    } catch (err) {
        console.error("Error fetching company logo:", err.message);
        return {
            domain: null,
            logoUrl: null
        };
    }
};
