"use client";

import { useState } from "react";
import { Upload, X, Package, Mail } from "lucide-react";

export default function UploadMailPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedMailbox, setSelectedMailbox] = useState("");
  const [packageType, setPackageType] = useState<"correspondence" | "package">("correspondence");
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle upload
    console.log({ selectedMailbox, packageType, carrier, trackingNumber, files });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Upload Mail</h1>
        <p className="text-gray-600 mt-1">Manually add mail items to the system</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Mailbox Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mailbox <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedMailbox}
            onChange={(e) => setSelectedMailbox(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00] focus:border-transparent"
          >
            <option value="">Select a mailbox...</option>
            <option value="101">PMB 101 - Design Studio LLC</option>
            <option value="205">PMB 205 - Tech Startup Inc</option>
            <option value="342">PMB 342 - Acme Corp</option>
            <option value="156">PMB 156 - John Smith</option>
            <option value="089">PMB 089 - Sarah Johnson</option>
          </select>
        </div>

        {/* Package Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Package Type <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setPackageType("correspondence")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                packageType === "correspondence"
                  ? "border-[#FFCC00] bg-[#FFF4BF]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Mail size={18} />
              Correspondence
            </button>
            <button
              type="button"
              onClick={() => setPackageType("package")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                packageType === "package"
                  ? "border-[#FFCC00] bg-[#FFF4BF]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Package size={18} />
              Package
            </button>
          </div>
        </div>

        {/* Carrier & Tracking */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Carrier</label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00]"
            >
              <option value="">Select carrier...</option>
              <option value="USPS">USPS</option>
              <option value="UPS">UPS</option>
              <option value="FedEx">FedEx</option>
              <option value="Amazon">Amazon</option>
              <option value="DHL">DHL</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00]"
            />
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images <span className="text-red-500">*</span>
          </label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? "border-[#FFCC00] bg-[#FFF4BF]" : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop images here, or{" "}
              <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                browse
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
              </label>
            </p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB each</p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-gray-500">IMG</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <X size={18} className="text-gray-600" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedMailbox || files.length === 0}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Upload Mail
          </button>
        </div>
      </form>
    </div>
  );
}
