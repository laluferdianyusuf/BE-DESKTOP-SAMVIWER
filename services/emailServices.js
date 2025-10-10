const EmailRepository = require("../repositories/emailRepository");

class EmailService {
  static async createEmail({ emailName }) {
    try {
      const findEmail = await EmailRepository.getOneEmail({ emailName });
      if (findEmail) {
        return {
          status: false,
          status_code: 403,
          message: "emailName sudah digunakan",
          data: null,
        };
      }
      if (!emailName) {
        return {
          status: false,
          status_code: 403,
          message: "emailId dan emailName wajib diisi",
          data: null,
        };
      }

      const newEmail = await EmailRepository.createEmail({
        emailName,
      });
      return {
        status: true,
        status_code: 201,
        message: "Email berhasil dibuat",
        data: newEmail,
      };
    } catch (error) {
      console.log(error);

      return {
        status: false,
        status_code: 500,
        message: "Error" + error.message,
        data: null,
      };
    }
  }

  static async getEmails({ sort, order }) {
    try {
      const emails = await EmailRepository.getEmails({ sort, order });
      return {
        status: true,
        status_code: 200,
        message: "Daftar email berhasil diambil",
        data: emails,
      };
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: "Error" + error.message,
        data: null,
      };
    }
  }

  static async getEmailByEmail({ emailName }) {
    try {
      if (!emailName) {
        return {
          status: false,
          status_code: 403,
          message: "emailName wajib diisi",
        };
      }

      const emails = await EmailRepository.getEmailByEmail({ emailName });
      return {
        status: true,
        status_code: 200,
        message: "Email ditemukan",
        data: emails,
      };
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: "Error" + error.message,
        data: null,
      };
    }
  }

  static async updateEmail({ id, emailName }) {
    try {
      const getEmail = await EmailRepository.getEmailById({ id });

      if (!getEmail) {
        return {
          status: false,
          status_code: 404,
          message: "No email found",
          data: null,
        };
      }

      const update = await EmailRepository.updateEmail({
        id: id,
        emailName,
      });
      return {
        status: true,
        status_code: 200,
        message: "Email updated successfully",
        data: update,
      };
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: "Server Error" + error,
        data: null,
      };
    }
  }

  static async deleteEmail({ id }) {
    try {
      const getEmail = await EmailRepository.getEmailById({ id });

      if (!getEmail) {
        return {
          status: false,
          status_code: 404,
          message: "No email found",
          data: null,
        };
      }

      const update = await EmailRepository.deleteEmail({ id: id });
      return {
        status: true,
        status_code: 200,
        message: "Email deleted successfully",
        data: update,
      };
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: "Server Error" + error,
        data: null,
      };
    }
  }
}

module.exports = EmailService;
