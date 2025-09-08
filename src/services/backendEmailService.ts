// Service pour communiquer avec notre Firebase Functions backend
interface EmailRequest {
  to: string;
  toName: string;
  subject: string;
  htmlContent: string;
  appointmentDetails?: {
    id: string;
    date: string;
    time: string;
    coachName: string;
    talentName: string;
    type: string;
  };
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  message: string;
  error?: string;
}

export class BackendEmailService {
  // URL de base pour les Firebase Functions
  private static getBaseUrl(): string {
    return 'https://us-central1-talents-tech-senegal.cloudfunctions.net';
  }

  /**
   * Envoie un email via Firebase Functions
   */
  static async sendEmail(emailData: EmailRequest): Promise<EmailResponse> {
    try {
      console.log('📧 Envoi email via Firebase Functions:', emailData.to);
      
      const response = await fetch(`${this.getBaseUrl()}/sendEmail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Email envoyé via Firebase Functions:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Erreur envoi email Firebase Functions:', error);
      return {
        success: false,
        message: 'Erreur lors de l\'envoi',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Envoi notification nouveau rendez-vous
   */
  static async sendNewAppointment(data: {
    recipientEmail: string;
    recipientName: string;
    coachName: string;
    appointmentDate: string;
    appointmentTime: string;
    meetingType: string;
    meetLink?: string;
    calendarLink?: string;
  }): Promise<boolean> {
    const subject = `Nouveau rendez-vous de coaching - ${data.appointmentDate}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #61bfac;">✓ Nouveau rendez-vous confirme</h2>
        <p>Bonjour <strong>${data.recipientName}</strong>,</p>
        <p>Votre rendez-vous de coaching a été confirmé avec les détails suivants :</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Date :</strong> ${data.appointmentDate}</p>
          <p><strong>Heure :</strong> ${data.appointmentTime}</p>
          <p><strong>Coach :</strong> ${data.coachName}</p>
          <p><strong>Type :</strong> ${data.meetingType}</p>
          ${data.meetLink ? `<p><strong>Lien Meet :</strong> <a href="${data.meetLink}">${data.meetLink}</a></p>` : ''}
          ${data.calendarLink ? `<p><strong>Ajouter au calendrier :</strong> <a href="${data.calendarLink}">Cliquez ici</a></p>` : ''}
        </div>
        <p>Nous vous rappelons ce rendez-vous 24h avant la séance.</p>
        <p>À bientôt sur ProdTalent !</p>
        <hr style="margin: 30px 0;">
        <p style="font-size: 12px; color: #666;">
          Cet email a été envoyé automatiquement par ProdTalent.<br>
          Si vous avez des questions, contactez-nous.
        </p>
      </div>
    `;

    const result = await this.sendEmail({
      to: data.recipientEmail,
      toName: data.recipientName,
      subject,
      htmlContent,
      appointmentDetails: {
        id: '', // Sera rempli par appointmentService
        date: data.appointmentDate,
        time: data.appointmentTime,
        coachName: data.coachName,
        talentName: data.recipientName,
        type: 'new_appointment'
      }
    });

    return result.success;
  }

  /**
   * Envoi confirmation de rendez-vous
   */
  static async sendAppointmentConfirmation(data: {
    recipientEmail: string;
    recipientName: string;
    coachName: string;
    appointmentDate: string;
    appointmentTime: string;
    appointmentType: string;
    meetLink?: string;
    calendarLink?: string;
  }): Promise<boolean> {
    const subject = `Rendez-vous confirme - ${data.appointmentDate}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #61bfac;">Rendez-vous confirme</h2>
        <p>Bonjour <strong>${data.recipientName}</strong>,</p>
        <p>Votre rendez-vous de coaching est maintenant <strong>confirmé</strong> :</p>
        <div style="background: #f0faf8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #61bfac;">
          <p><strong>Date :</strong> ${data.appointmentDate}</p>
          <p><strong>Heure :</strong> ${data.appointmentTime}</p>
          <p><strong>Coach :</strong> ${data.coachName}</p>
          <p><strong>Type :</strong> ${data.appointmentType}</p>
          ${data.meetLink ? `<p><strong>Rejoindre la session :</strong> <a href="${data.meetLink}" style="color: #61bfac; font-weight: bold;">Cliquer ici pour rejoindre</a></p>` : ''}
          ${data.calendarLink ? `<p><strong>Calendrier :</strong> <a href="${data.calendarLink}" style="color: #61bfac;">Ajouter a votre calendrier</a></p>` : ''}
        </div>
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p><strong>Prochaines etapes :</strong></p>
          <ul>
            <li>Vérifiez votre connexion internet avant la session</li>
            <li>Préparez vos questions et objectifs</li>
            <li>Rejoignez la session 5 minutes avant l'heure</li>
          </ul>
        </div>
        <p>Bon coaching sur ProdTalent !</p>
        <hr style="margin: 30px 0;">
        <p style="font-size: 12px; color: #666;">
          Email automatique de ProdTalent - Ne pas répondre<br>
          Pour toute question, contactez votre coach directement.
        </p>
      </div>
    `;

    const result = await this.sendEmail({
      to: data.recipientEmail,
      toName: data.recipientName,
      subject,
      htmlContent,
      appointmentDetails: {
        id: '', // Sera rempli par appointmentService
        date: data.appointmentDate,
        time: data.appointmentTime,
        coachName: data.coachName,
        talentName: data.recipientName,
        type: 'confirmation'
      }
    });

    return result.success;
  }

  /**
   * Envoi notification recommandation talent
   */
  static async sendTalentRecommendation(data: {
    recipientEmail: string;
    recipientName: string;
    talentName: string;
    coachName: string;
    jobTitle?: string;
    companyName?: string;
    message: string;
  }): Promise<boolean> {
    const subject = `Nouveau talent recommandé - ${data.jobTitle || 'Poste'} - ProdTalent`;
    
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f7;">
        <!-- Header ProdTalent -->
        <div style="background: #61bfac; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">ProdTalent</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Nouveau talent recommandé</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1a1a1a; margin-top: 0;">Bonjour ${data.recipientName}</h2>
          
          <div style="background: #f5f5f7; padding: 20px; border-radius: 8px; border-left: 4px solid #61bfac; margin: 20px 0;">
            <p style="margin: 0; color: #1a1a1a; font-size: 16px;">
              <strong style="color: #0a0a0a;">${data.coachName}</strong> <span style="color: #61bfac;">(Coach)</span> vous a recommandé un talent :
            </p>
            <h3 style="color: #61bfac; margin: 15px 0 10px 0; font-weight: bold;">${data.talentName}</h3>
            ${data.jobTitle ? `<p style="margin: 8px 0; color: #1a1a1a;"><strong>Pour le poste :</strong> ${data.jobTitle}</p>` : ''}
            ${data.companyName ? `<p style="margin: 8px 0; color: #1a1a1a;"><strong>Entreprise :</strong> ${data.companyName}</p>` : ''}
          </div>
          
          <div style="background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #f0f0f0; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #1a1a1a;">Message du coach :</h4>
            <p style="margin: 0; color: #555; font-style: italic; line-height: 1.6;">"${data.message}"</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://prodtalent.com/talents" 
               style="background: #61bfac; 
                      color: #ffffff; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block;
                      transition: transform 0.2s;
                      box-shadow: 0 2px 4px rgba(97, 191, 172, 0.3);">
              Contacter ce talent
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #f5f5f7; margin: 30px 0;">
          
          <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
            ProdTalent - Connecter les talents et opportunités<br>
            <a href="https://prodtalent.com" style="color: #61bfac; text-decoration: none;">prodtalent.com</a>
          </p>
        </div>
      </div>
    `;

    const result = await this.sendEmail({
      to: data.recipientEmail,
      toName: data.recipientName,
      subject,
      htmlContent
    });

    return result.success;
  }

  /**
   * Envoi notification recommandation pour talent  
   */
  static async sendRecommendationToTalent(data: {
    recipientEmail: string;
    recipientName: string;
    coachName: string;
    jobTitle?: string;
    companyName?: string;
    message: string;
  }): Promise<boolean> {
    const subject = `Vous avez été recommandé pour ${data.jobTitle || 'un poste'} - ProdTalent`;
    
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f7;">
        <!-- Header ProdTalent -->
        <div style="background: #61bfac; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">ProdTalent</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Vous avez été recommandé !</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1a1a1a; margin-top: 0;">Félicitations ${data.recipientName} !</h2>
          
          <div style="background: #f0faf8; padding: 20px; border-radius: 8px; border-left: 4px solid #61bfac; margin: 20px 0;">
            <p style="margin: 0; color: #1a1a1a; font-size: 16px;">
              <strong style="color: #0a0a0a;">${data.coachName}</strong> <span style="color: #61bfac;">(Coach)</span> vous a recommandé pour une opportunité !
            </p>
            ${data.jobTitle ? `<h3 style="color: #61bfac; margin: 15px 0 10px 0; font-weight: bold;">${data.jobTitle}</h3>` : ''}
            ${data.companyName ? `<p style="margin: 8px 0; color: #1a1a1a;"><strong>Entreprise :</strong> ${data.companyName}</p>` : ''}
          </div>
          
          <div style="background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #f0f0f0; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #1a1a1a;">Message de votre coach :</h4>
            <p style="margin: 0; color: #555; font-style: italic; line-height: 1.6;">"${data.message}"</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://prodtalent.com/recommendations" 
               style="background: #61bfac; 
                      color: #ffffff; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block;
                      transition: transform 0.2s;
                      box-shadow: 0 2px 4px rgba(97, 191, 172, 0.3);">
              Voir ma recommandation
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #f5f5f7; margin: 30px 0;">
          
          <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
            ProdTalent - Connecter les talents et opportunités<br>
            <a href="https://prodtalent.com" style="color: #61bfac; text-decoration: none;">prodtalent.com</a>
          </p>
        </div>
      </div>
    `;

    const result = await this.sendEmail({
      to: data.recipientEmail,
      toName: data.recipientName,
      subject,
      htmlContent
    });

    return result.success;
  }

  /**
   * Envoi notification nouvelle offre d'emploi
   */
  static async sendJobNotification(data: {
    recipientEmail: string;
    recipientName: string;
    jobTitle: string;
    companyName: string;
    jobLocation: string;
    contractType: string;
    jobDescription?: string;
  }): Promise<boolean> {
    const subject = `Nouvelle offre d'emploi - ${data.jobTitle} - ProdTalent`;
    
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f7;">
        <!-- Header ProdTalent -->
        <div style="background: #61bfac; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">ProdTalent</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Nouvelle offre d'emploi</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1a1a1a; margin-top: 0;">Bonjour ${data.recipientName}</h2>
          
          <p style="color: #1a1a1a; line-height: 1.6;">
            Une nouvelle offre d'emploi correspondant à votre profil vient d'être publiée !
          </p>
          
          <div style="background: #f5f5f7; padding: 20px; border-radius: 8px; border-left: 4px solid #61bfac; margin: 20px 0;">
            <h3 style="color: #61bfac; margin-top: 0; font-weight: bold;">${data.jobTitle}</h3>
            <p style="margin: 8px 0; color: #1a1a1a;"><strong>Entreprise :</strong> ${data.companyName}</p>
            <p style="margin: 8px 0; color: #1a1a1a;"><strong>Localisation :</strong> ${data.jobLocation}</p>
            <p style="margin: 8px 0; color: #1a1a1a;"><strong>Type de contrat :</strong> ${data.contractType}</p>
          </div>
          
          ${data.jobDescription ? `
          <div style="background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #f0f0f0; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #1a1a1a;">Description du poste :</h4>
            <p style="margin: 0; color: #555; line-height: 1.6;">${data.jobDescription.substring(0, 200)}${data.jobDescription.length > 200 ? '...' : ''}</p>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://prodtalent.com/jobs" 
               style="background: #61bfac; 
                      color: #ffffff; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block;
                      transition: transform 0.2s;
                      box-shadow: 0 2px 4px rgba(97, 191, 172, 0.3);">
              Voir l'offre complète
            </a>
          </div>
          
          <div style="background: #fff8f0; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ff9500;">
            <p style="margin: 0; color: #8b4513; font-size: 14px;">
              💡 <strong>Conseil :</strong> N'hésitez pas à postuler rapidement et à personnaliser votre candidature !
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #f5f5f7; margin: 30px 0;">
          
          <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
            ProdTalent - Connecter les talents et opportunités<br>
            <a href="https://prodtalent.com" style="color: #61bfac; text-decoration: none;">prodtalent.com</a>
          </p>
        </div>
      </div>
    `;

    const result = await this.sendEmail({
      to: data.recipientEmail,
      toName: data.recipientName,
      subject,
      htmlContent
    });

    return result.success;
  }
}