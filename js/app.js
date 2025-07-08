document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting initialization...');
    
    // Constants and parameters
    const PARAMETERS = {
        CA_HT_PLAFOND_FIXE: 20000,
        CA_HT_PLAFOND_PERCENT: 0.005,
        TAUX_REDUCTION_60: 0.60,
        TAUX_REDUCTION_40: 0.40,
        SEUIL_TAUX_40: 2000000,
        SEUIL_IS_15: 42500,
        TAUX_IS_15: 0.15,
        TAUX_IS_25: 0.25,
        DUREE_REPORT: 5,
        MIN_AMOUNT: 0.01
    };

    // Tooltips content
    const tooltipContent = {
        general: {
            type: `
                <div style="text-align: left; max-width: 400px;">
                    <div class="mb-3">
                        <p><strong>Règles applicables :</strong></p>
                        <ul style="padding-left: 20px; margin-bottom: 10px;">
                            <li>60% de réduction jusqu'à 2M€ de dons</li>
                            <li>40% au-delà de 2M€</li>
                            <li>Plafond : 20k€ ou 0,5% du CA HT</li>
                        </ul>
                    </div>
                    <div>
                        <p><strong>Organismes concernés :</strong></p>
                        <ul style="padding-left: 20px; margin-bottom: 0;">
                            <li>Organismes d'intérêt général</li>
                            <li>Fondations et associations reconnues d'utilité publique</li>
                            <li>Organismes de mise en valeur du patrimoine</li>
                            <li>Établissements d'enseignement supérieur</li>
                            <li>Organismes de recherche</li>
                            <li><em>Nouveau 2024 :</em> Organismes concourant à l'égalité femmes-hommes</li>
                        </ul>
                    </div>
                </div>
            `,
            reduction: `Réduction d'impôt de 60% du don jusqu'à 2M€, puis 40% au-delà, dans la limite du plafond`
        },
        repas: {
            type: `
                <div style="text-align: left; max-width: 400px;">
                    <div class="mb-3">
                        <p><strong>Règles applicables :</strong></p>
                        <ul style="padding-left: 20px; margin-bottom: 10px;">
                            <li>60% de réduction sur tout le montant</li>
                            <li>Plafond : 20k€ ou 0,5% du CA HT</li>
                            <li>Pas de seuil de 2M€</li>
                        </ul>
                    </div>
                    <div>
                        <p><strong>Organismes concernés :</strong></p>
                        <ul style="padding-left: 20px; margin-bottom: 5px;">
                            <li>Organismes d'aide gratuite aux personnes en difficulté :</li>
                        </ul>
                        <ul style="padding-left: 35px; margin-bottom: 0;">
                            <li>Repas</li>
                            <li>Soins</li>
                            <li>Logement</li>
                            <li>Produits de première nécessité</li>
                        </ul>
                        <p style="font-size: 0.9em; font-style: italic; margin-top: 8px; margin-bottom: 0;">
                            Réf : Décret n° 2020-1013 du 7 août 2020
                        </p>
                    </div>
                </div>
            `,
            reduction: `Réduction d'impôt de 60% du don sur la totalité du montant, dans la limite du plafond`
        }
    };

    // Initialize tooltips once
    const tooltipList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipList.forEach(el => {
        new bootstrap.Tooltip(el);
    });

    // Update association type tooltip
    const associationType = document.getElementById('associationType');
    const infoIcon = document.querySelector('.info-icon');
    
    associationType.addEventListener('change', function() {
        const type = this.value;
        
        // Update association type tooltip
        const typeTooltip = bootstrap.Tooltip.getInstance(infoIcon);
        if (typeTooltip) {
            typeTooltip.dispose();
        }
        infoIcon.setAttribute('title', tooltipContent[type].type);
        new bootstrap.Tooltip(infoIcon);

        // Update reduction tooltip
        const reductionTooltip = document.querySelector('#synthReductionMecenat + .info-icon');
        if (reductionTooltip) {
            const bsTooltip = bootstrap.Tooltip.getInstance(reductionTooltip);
            if (bsTooltip) {
                bsTooltip.dispose();
            }
            reductionTooltip.setAttribute('title', tooltipContent[type].reduction);
            new bootstrap.Tooltip(reductionTooltip);
        }
    });

    // Format utilities
    function formatNumber(value) {
        if (!value) return 0;
        const cleaned = value.toString().replace(/\s/g, '').replace(/,/g, '.');
        const number = parseFloat(cleaned);
        return isNaN(number) ? 0 : number;
    }

    function formatCurrency(number) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0,
            minimumFractionDigits: 0
        }).format(number);
    }

    function formatPercent(number) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'percent',
            maximumFractionDigits: 0
        }).format(number);
    }

    // Auto-format input fields
    function formatInputValue(input) {
        const value = input.value.replace(/\s/g, '');
        const number = parseFloat(value);
        if (!isNaN(number)) {
            input.value = new Intl.NumberFormat('fr-FR').format(number);
        }
    }

    // Add input formatting
    const donationInput = document.getElementById('donationAmount');
    const turnoverInput = document.getElementById('turnover');
    const resultatComptableInput = document.getElementById('resultatComptable');

    donationInput.addEventListener('blur', function() {
        formatInputValue(this);
    });

    turnoverInput.addEventListener('blur', function() {
        formatInputValue(this);
    });

    resultatComptableInput.addEventListener('blur', function() {
        formatInputValue(this);
    });

    // Chart instance


    // Form submission
    const form = document.getElementById('donationForm');
    const resultsWrapper = document.getElementById('results-wrapper');
    const resultsDiv = document.getElementById('results');
    const premiumOverlay = document.getElementById('premium-overlay');
    const pdfForm = document.getElementById('pdfForm');
    const userEmailInput = document.getElementById('userEmail');
    const pdfStatus = document.getElementById('pdf-status');
    
    console.log('Form element:', form);
    console.log('Results div:', resultsDiv);

    form.addEventListener('submit', function(e) {
        console.log('Form submitted!');
        e.preventDefault();
        
        // Get and validate inputs
        const donationAmount = formatNumber(document.getElementById('donationAmount').value);
        const turnover = formatNumber(document.getElementById('turnover').value);
        const resultatComptable = formatNumber(document.getElementById('resultatComptable').value);
        const associationTypeValue = document.getElementById('associationType').value;
        
        console.log('Donation amount:', donationAmount);
        console.log('Turnover:', turnover);
        console.log('Résultat comptable:', resultatComptable);
        console.log('Association type:', associationTypeValue);
        
        if (donationAmount <= 0 || turnover <= 0 || resultatComptable <= 0) {
            alert('Veuillez saisir des montants valides (supérieurs à 0)');
            return;
        }

        // Calculate plafond
        const plafond = Math.max(PARAMETERS.CA_HT_PLAFOND_FIXE, turnover * PARAMETERS.CA_HT_PLAFOND_PERCENT);
        const montantEligible = Math.min(donationAmount, plafond);
        
        // Calculate reduction based on association type
        let reductionImmediate = 0;
        let tauxReduction = 0;
        
        if (associationTypeValue === 'repas') {
            // Cas repas : 60% pour tous les montants
            tauxReduction = PARAMETERS.TAUX_REDUCTION_60;
            reductionImmediate = montantEligible * tauxReduction;
        } else {
            // Cas général : 60% jusqu'à 2M€, 40% au-delà
            if (montantEligible <= PARAMETERS.SEUIL_TAUX_40) {
                // Tout le montant éligible est à 60%
                tauxReduction = PARAMETERS.TAUX_REDUCTION_60;
                reductionImmediate = montantEligible * tauxReduction;
            } else {
                // Montant éligible > 2M€ : 60% sur les 2M€ + 40% sur le reste
                const montant60 = PARAMETERS.SEUIL_TAUX_40;
                const montant40 = montantEligible - PARAMETERS.SEUIL_TAUX_40;
                reductionImmediate = (montant60 * PARAMETERS.TAUX_REDUCTION_60) + (montant40 * PARAMETERS.TAUX_REDUCTION_40);
                // Taux moyen pondéré pour l'affichage
                tauxReduction = reductionImmediate / montantEligible;
            }
        }
        
        // Calculate reports
        const montantDepassement = Math.max(0, donationAmount - montantEligible);
        let reductionReportable = 0;
        
        if (montantDepassement > 0) {
            if (associationTypeValue === 'repas') {
                // Cas repas : 60% sur l'excédent
                reductionReportable = montantDepassement * PARAMETERS.TAUX_REDUCTION_60;
            } else {
                // Cas général : appliquer les mêmes taux que sur le montant initial
                if (donationAmount <= PARAMETERS.SEUIL_TAUX_40) {
                    // Tout l'excédent est à 60%
                    reductionReportable = montantDepassement * PARAMETERS.TAUX_REDUCTION_60;
                } else {
                    reductionReportable = montantDepassement * PARAMETERS.TAUX_REDUCTION_40;
                }
            }
        }

        console.log('Calculated values:', {
            plafond,
            montantEligible,
            tauxReduction,
            montantDepassement,
            reductionImmediate,
            reductionReportable
        });

        // Calculate fiscal impact
        const resultatApres = resultatComptable - donationAmount;
        
        // Calcul IS avant don
        let isAvant = 0;
        if (resultatComptable > 0) {
            if (resultatComptable <= PARAMETERS.SEUIL_IS_15) {
                isAvant = resultatComptable * PARAMETERS.TAUX_IS_15;
            } else {
                isAvant = (PARAMETERS.SEUIL_IS_15 * PARAMETERS.TAUX_IS_15) + 
                          ((resultatComptable - PARAMETERS.SEUIL_IS_15) * PARAMETERS.TAUX_IS_25);
            }
        }

        // Calcul IS après don
        let isApres = 0;
        if (resultatApres > 0) {
            if (resultatApres <= PARAMETERS.SEUIL_IS_15) {
                isApres = resultatApres * PARAMETERS.TAUX_IS_15;
            } else {
                isApres = (PARAMETERS.SEUIL_IS_15 * PARAMETERS.TAUX_IS_15) + 
                          ((resultatApres - PARAMETERS.SEUIL_IS_15) * PARAMETERS.TAUX_IS_25);
            }
        }

        // Final IS
        const isApresReduction = Math.max(0, isApres - reductionImmediate);
        const economieIS = isAvant - isApresReduction;

        // Update display
        resultsDiv.style.display = 'block';
        document.getElementById('synthDon').textContent = formatCurrency(donationAmount);
        document.getElementById('synthPlafond').textContent = formatCurrency(plafond);
        document.getElementById('synthTaux').textContent = formatPercent(tauxReduction);
        document.getElementById('synthDepassement').textContent = formatCurrency(montantDepassement);
        document.getElementById('synthReductionReportable').textContent = formatCurrency(reductionReportable);
        document.getElementById('synthResultatAvant').textContent = formatCurrency(resultatComptable);
        document.getElementById('synthResultatApres').textContent = formatCurrency(resultatApres);
        document.getElementById('synthISAvant').textContent = formatCurrency(isAvant);
        document.getElementById('synthReductionMecenat').textContent = formatCurrency(reductionImmediate);
        document.getElementById('synthISApres').textContent = formatCurrency(isApresReduction);
        document.getElementById('synthEconomieIS').textContent = formatCurrency(economieIS);

        console.log('Results should be visible now');

        // Show results wrapper, blur results, and show premium overlay
        resultsWrapper.style.display = 'block';
        document.getElementById('premium-content').classList.add('blurred');
        premiumOverlay.style.display = 'flex';
        resultsWrapper.scrollIntoView({ behavior: 'smooth' });

        // Update tooltips based on calculations
        const tooltips = {
            'synthDon': `Montant total du don : ${formatCurrency(donationAmount)}`,
            'synthPlafond': `Le plafond est le plus élevé entre 20 000€ et ${(PARAMETERS.CA_HT_PLAFOND_PERCENT * 100).toFixed(1)}% du CA HT (${formatCurrency(turnover)})`,
            'synthTaux': `Taux moyen de réduction : ${(tauxReduction * 100).toFixed(1)}%${associationTypeValue === 'general' && donationAmount > PARAMETERS.SEUIL_TAUX_40 ? '\n(60% jusqu\'à 2M€, 40% au-delà)' : ''}`,
            'synthDepassement': `Partie du don dépassant le plafond : ${formatCurrency(montantDepassement)}`,
            'synthReductionReportable': `Réduction d'impôt reportable sur 5 ans : ${formatCurrency(reductionReportable)}`,
            'synthResultatAvant': `Résultat comptable avant déduction du don : ${formatCurrency(resultatComptable)}`,
            'synthResultatApres': `Résultat comptable après déduction du don : ${formatCurrency(resultatApres)}`,
            'synthISAvant': `IS calculé sur le résultat avant don\n15% jusqu'à ${formatCurrency(PARAMETERS.SEUIL_IS_15)}, 25% au-delà`,
            'synthISApres': `IS après déduction du don et application de la réduction mécénat`,
            'synthEconomieIS': `Économie totale d'IS = IS avant don (${formatCurrency(isAvant)}) - IS après réduction (${formatCurrency(isApresReduction)})`
        };

        // Update all tooltips
        Object.entries(tooltips).forEach(([id, text]) => {
            const element = document.querySelector(`#${id} + .info-icon`);
            if (element) {
                const tooltip = bootstrap.Tooltip.getInstance(element);
                if (tooltip) {
                    tooltip.dispose();
                }
                element.setAttribute('title', text);
                new bootstrap.Tooltip(element);
            }
        });
    });

    // Set initial tooltip
    infoIcon.setAttribute('title', tooltipContent[associationType.value].type);
    new bootstrap.Tooltip(infoIcon);
    
    console.log('Initialization complete');

    // --- PDF & Email Logic ---

    async function generatePdfAsString() {
        const { jsPDF } = window.jspdf;
        const resultsToCapture = document.getElementById('results');
        const premiumContent = document.getElementById('premium-content');
        const premiumOverlay = document.getElementById('premium-overlay');

        const wasBlurred = premiumContent.classList.contains('blurred');
        const overlayWasVisible = premiumOverlay.style.display !== 'none';

        // Un-blur for capture
        if (wasBlurred) premiumContent.classList.remove('blurred');
        if (overlayWasVisible) premiumOverlay.style.display = 'none';

        let imgData;
        try {
            const canvas = await html2canvas(resultsToCapture, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            imgData = canvas.toDataURL('image/png');
        } finally {
            // Restore UI state regardless of success or failure
            if (wasBlurred) premiumContent.classList.add('blurred');
            if (overlayWasVisible) premiumOverlay.style.display = 'flex';
        }

        if (!imgData) {
            throw new Error('PDF image generation failed.');
        }

        const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;

        const img = new Image();
        img.src = imgData;
        await new Promise(resolve => { img.onload = resolve; });

        const ratio = img.width / img.height;
        let newWidth = pdfWidth - margin * 2;
        let newHeight = newWidth / ratio;

        if (newHeight > pdfHeight - margin * 2) {
            newHeight = pdfHeight - margin * 2;
            newWidth = newHeight * ratio;
        }

        const x = (pdfWidth - newWidth) / 2;
        const y = margin;

        pdf.addImage(imgData, 'PNG', x, y, newWidth, newHeight);
        return pdf.output('datauristring').split(',')[1]; // Return as base64
    }

    pdfForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        pdfStatus.innerHTML = `<div class="spinner-border spinner-border-sm" role="status"></div><span class="ms-2">Génération et envoi en cours...</span>`;
        const submitButton = pdfForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        try {
            const pdfBase64 = await generatePdfAsString();
            const userEmail = userEmailInput.value;

            const response = await fetch('/api/send-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email: userEmail, 
                    pdf: pdfBase64 
                }),
            });

            if (response.ok) {
                pdfStatus.innerHTML = `<span class="text-success"><i class="bi bi-check-circle-fill me-2"></i>Simulation envoyée avec succès à ${userEmail} !</span>`;
                userEmailInput.value = '';
                // Hide the form after a delay for better UX
                setTimeout(() => {
                    premiumOverlay.style.display = 'none';
                    pdfStatus.innerHTML = ''; // Clear status
                }, 4000);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur du serveur');
            }

        } catch (error) {
            console.error('Failed to send email:', error);
            pdfStatus.innerHTML = `<span class="text-danger">Erreur: ${error.message}. Veuillez réessayer.</span>`;
        } finally {
            submitButton.disabled = false;
        }
    });
}); 