"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { motion } from "framer-motion";
import { Edit, Mail, Save, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface profile_info {
  uid: number;
  user_name: string;
  user_image: string | null;
  user_email: string;
  bio: string | null;
  location: string | null;
  isverified: boolean;
}

const initialD: profile_info = {
  uid: 0,
  user_name: "",
  user_image: null,
  user_email: "",
  bio: null,
  location: null,
  isverified: false,
};

export default function ProfileCard() {
  const [initialData, setInitialData] = useState<profile_info>(initialD);
  const [data, setData] = useState<profile_info>(initialData);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isChanged, setIsChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem("token");

  const fetch_data = async () => {
    axios
      .get(`${process.env.NEXT_PUBLIC_IP_ADD}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setInitialData(res.data);
        setData(res.data);
      });
  };

  useEffect(() => {
    setIsChanged(JSON.stringify(data) !== JSON.stringify(initialData));
    fetch_data();
  }, []);

  const handleEdit = (field: string) => {
    setEditingField(field);
  };

  const handleSave = (field: string, value: string | number) => {
    setData((prevData) => ({ ...prevData, [field]: value }));
    setEditingField(null);
    setIsChanged(true);
  };

  const handleSaveAll = async () => {
    if (isLoading) return;
    const temp = {
      user_name: data.user_name,
      user_email: data.user_email,
      bio: data.bio,
      location: data.location,
    };

    setIsLoading(true);
    try {
      await axios
        .put(`${process.env.NEXT_PUBLIC_IP_ADD}/user/profile`, temp, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((res) => {
          if (res.status >= 200 && res.status < 300) {
            toast.success("Profile updated successfully");
            fetch_data();
            setIsChanged(false);
            setIsLoading(false);
          } else {
            toast.error(res?.data?.message || "Failed to update profile");
          }
        });
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-20 z-10"
    >
      <Card className="w-full max-w-2xl mx-auto bg-opacity-100 bg-transparent-20 backdrop-blur-lg shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-white">
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={data.user_image || ""}
                alt={data.user_name}
                className="object-cover"
              />
              <AvatarFallback>
                {data.user_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <EditableField
                value={data.user_name}
                field="user_name"
                editingField={editingField}
                handleEdit={handleEdit}
                handleSave={handleSave}
              />
              <EditableField
                value={data.user_email}
                field="user_email"
                editingField={editingField}
                handleEdit={handleEdit}
                handleSave={handleSave}
                icon={<Mail className="w-4 h-4" />}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <EditableInfoItem
              icon={<User />}
              label="Bio"
              value={data.bio || ""}
              field="bio"
              editingField={editingField}
              handleEdit={handleEdit}
              handleSave={handleSave}
            />
            <EditableInfoItem
              icon={<User />}
              label="Location"
              value={data.location || ""}
              field="location"
              editingField={editingField}
              handleEdit={handleEdit}
              handleSave={handleSave}
            />
          </div>
        </CardContent>
      </Card>
      {isChanged && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 right-4"
        >
          <Button onClick={handleSaveAll}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

interface EditableFieldProps {
  value: string | number;
  field: string;
  editingField: string | null;
  handleEdit: (field: string) => void;
  handleSave: (field: string, value: string | number) => void;
  icon?: React.ReactNode;
  type?: string;
  unit?: string;
}

function EditableField({
  value,
  field,
  editingField,
  handleEdit,
  handleSave,
  icon,
  type = "text",
  unit,
}: EditableFieldProps) {
  const [tempValue, setTempValue] = useState(value);

  const onSave = () => {
    handleSave(field, tempValue);
  };

  return (
    <div className="flex items-center space-x-2 bg-gray-100/75 p-2 rounded-lg">
      <Button variant="ghost" size="sm" onClick={() => handleEdit(field)}>
        <Edit className="w-4 h-4" />
      </Button>
      {icon}
      {editingField === field ? (
        <div className="flex-1 flex items-center">
          <Input
            type={type}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="mr-2"
          />
          <Button onClick={onSave} size="sm">
            <Save className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <span className="flex-1">
          {value}
          {unit}
        </span>
      )}
    </div>
  );
}

function EditableInfoItem(props: EditableFieldProps & { label: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-white">{props.label}</p>
      <EditableField {...props} />
    </div>
  );
}
