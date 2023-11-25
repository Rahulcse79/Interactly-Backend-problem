import express from "express";
import mysql from "mysql";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
const port = 4000;

const zoho_headers = {
  Authorization:
    "Bearer 1000.76269cc2bc36c71d57c3cd0adbe0a9a3.7ff3a069c482a5a5fdb717974cd6feaf",
  "Content-Type": "application/json",
};

const db = mysql.createConnection({
  host: "127.0.0.1",
  database: "contactsList",
  user: "root",
  timezone: "Asia/Kolkata",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL: ", err);
    return;
  }
  console.log("Connected to MySQL");
});

app.use(bodyParser.json());

app.post("/createContact", async (req, res) => {
  const { first_name, last_name, email, mobile_number, data_store } = req.body;

  try {
    if (data_store === "CRM") {
      const zohoUser = {
        contacts: [
          {
            emails: [
              {
                is_primary: true,
                email_id: email,
              },
            ],
            phones: [
              {
                number: mobile_number,
                type: "mobile",
              },
            ],
            first_name: first_name,
            last_name: last_name,
          },
        ],
      };
      const result = await fetch(
        "https://contacts.zoho.com/api/v1/accounts/self/contacts?source=Self%20Client",
        {
          method: "POST",
          headers: zoho_headers,
          body: JSON.stringify(zohoUser),
        }
      );
      const response = await result.json();
      console.log("post", response);
      return res.status(200).json(response);
    } else if (data_store === "DATABASE") {
      const result = await db.query(
        `insert into contacts (first_name, last_name, email, mobile_number) values("${first_name}","${last_name}","${email}","${mobile_number}");`
      );

      const contactId = await result.insertId;
      
      return res.status(200).json({ message: "Contact created in DATABASE", contactId });
    } else {
      return res.status(400).json({ message: "Invalid data_store parameter" });
    }
  } catch (error) {
    console.error("Error creating contact:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/getContact", async (req, res) => {
  try {
    const { contact_id, data_store } = req.body;
    const result = await (
      await fetch(
        "https://contacts.zoho.com/api/v1/accounts/self/contacts/" + contact_id,
        { headers: zoho_headers, method: "GET" }
      )
    ).json();
    console.log("GET ", result);
    if (!contact_id || !data_store) {
      return res.status(200).json(result);
    }

    if (data_store === "CRM") {
      return res
        .status(400)
        .json({ message: "CRM data_store is not supported yet" });
    } else if (data_store === "DATABASE") {
      db.query(
        `SELECT id, first_name, last_name, email, mobile_number FROM contacts WHERE id = ${contact_id};`,
        (error, result) => {
          if (error) {
            res.status(400).json({ error: "Contact not found in DATABASE" });
          } else {
            console.log("Contact found in DATABASE ", result);
            res.status(200).json(result);
          }
        }
      );
    } else {
      return res.status(400).json({ message: "Invalid data_store parameter" });
    }
  } catch (error) {
    console.error("Error retrieving contact:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/updateContact", async (req, res) => {
  try {
    const { contact_id, new_email, new_mobile_number, data_store } = req.body;

    if (!contact_id || !new_email || !new_mobile_number || !data_store) {
      return res.status(400).json({ message: "Missing parameters" });
    }

    if (data_store === "CRM") {
      const zohoUpdateBody = {
        contacts: {
          emails: [{ is_primary: true, email_id: new_email }],
          phones: [
            {
              number: new_mobile_number,
              type: "mobile",
            },
          ],
        },
      };
      const result = await fetch(
        "https://contacts.zoho.com/api/v1/accounts/self/contacts/" + contact_id,
        {
          headers: zoho_headers,
          method: "PUT",
          body: JSON.stringify(zohoUpdateBody),
        }
      );
      const response = await result.json();
      console.log("put response", response);
      return res.status(400).json(response);
    } else if (data_store === "DATABASE") {
      // Assuming db is your database connection object
      db.query(
        `UPDATE contacts SET email = '${new_email}', mobile_number = '${new_mobile_number}' WHERE id = ${contact_id};`,
        (error, result) => {
          if (error) {
            res.status(400).json({ error: "Contact not found in DATABASE" });
          } else {
            console.log("Contact updated in DATABASE");
            res.status(200).json({ message: "Contact updated successfully" });
          }
        }
      );
    } else {
      return res.status(400).json({ message: "Invalid data_store parameter" });
    }
  } catch (error) {
    console.error("Error updating contact:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/deleteContact", async (req, res) => {
  try {
    const { contact_id, data_store } = req.body;
    if (!contact_id || !data_store) {
      return res.status(400).json();
    }
    else if (data_store === "CRM") {
      const result = await (await fetch(
        "https://contacts.zoho.com/api/v1/accounts/self/contacts/" + contact_id
      ),
      { headers: zoho_headers, method: "DELETE" }).json();
  
      console.log("delete: ", result);
      return res.status(200).json(result);
  
      // return res
      //   .status(400)
      //   .json({ message: "CRM data_store is not supported yet" });
    } else if (data_store === "DATABASE") {
      db.query(
        `DELETE FROM contacts WHERE id = ${contact_id};`,
        (error, result) => {
          if (error) {
            res.status(400).json({ error: "Contact not found in DATABASE" });
          } else {
            console.log("Contact deleted from DATABASE ", result);
            res.status(200).json({ message: "Contact deleted successfully" });
          }
        }
      );
    } else {
      return res.status(400).json({ message: "Invalid data_store parameter" });
    }
  } catch (error) {
    console.error("Error deleting contact:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
