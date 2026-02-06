import { Modal, Tabs, Button } from '@mantine/core';
import { FileText, Stethoscope, Thermometer, Pill, TestTube, Activity, Clock } from 'lucide-react';
import GeneralTab from './tabs/GeneralTab';
import PrenatalTab from './tabs/PrenatalTab';
import ImmunizationTab from './tabs/ImmunizationTab';
import SupplementationTab from './tabs/SupplementationTab';
import LabsTab from './tabs/LabsTab';
import DeliveryTab from './tabs/DeliveryTab';
import PostnatalTab from './tabs/PostnatalTab';

export default function PatientModal({
  opened,
  close,
  submitting,
  isEditing,
  formData,
  setFormData,
  formErrors,
  activeTab,
  setActiveTab,
  newVisit,
  setNewVisit,
  newSupp,
  setNewSupp,
  newLab,
  setNewLab,
  newPostpartumLog,
  setNewPostpartumLog,
  handleSubmit,
  nextTab,
  getAgeGroup,
  getImmunizationStats,
  handleTdChange,
  handleLmpChange,
  handleVisitDateChange,
  handleBMIChange,
  addVisitToList,
  removeVisit,
  editingVisitIndex,
  startEditVisit,
  addSupplement,
  removeSupplement,
  editingSupp,
  startEditSupplement,
  addLabLog,
  removeLabLog,
  editingLabIndex,
  startEditLabLog,
  addPostpartumLog,
  removePostpartumLog,
  editingPostpartumIndex,
  startEditPostpartumLog,
  handlePncDateChange,
  handleBirthWeightChange,
  handleBabySexChange,
  totalIFA,
  totalMMS,
  ifaProgress,
  totalPostpartum,
  postpartumProgress,
  isAborted,
}) {
  return (
    <Modal opened={opened} onClose={close} title={isEditing ? 'Edit Record' : 'Add New Record'} fullScreen overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}>
      <Tabs value={activeTab} onChange={setActiveTab} color="teal" variant="pills" radius="md">
        <Tabs.List mb="md" grow>
          <Tabs.Tab value="general" leftSection={<FileText size={14} />}>General Data</Tabs.Tab>
          <Tabs.Tab value="prenatal" leftSection={<Stethoscope size={14} />}>Prenatal Checkup (8ANC)</Tabs.Tab>
          <Tabs.Tab value="immunization" leftSection={<Thermometer size={14} />}>Immunization Status</Tabs.Tab>
          <Tabs.Tab value="supplementation" leftSection={<Pill size={14} />}>Prenatal Supplementation</Tabs.Tab>
          <Tabs.Tab value="labs" leftSection={<TestTube size={14} />}>Laboratory Screenings</Tabs.Tab>
          <Tabs.Tab value="delivery" leftSection={<Activity size={14} />}>Labor, Delivery and Birth Outcomes</Tabs.Tab>
          <Tabs.Tab value="postnatal" leftSection={<Clock size={14} />}>Postnatal Care and Postpartum Supplementation</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="general">
          <GeneralTab formData={formData} setFormData={setFormData} formErrors={formErrors} getAgeGroup={getAgeGroup} handleLmpChange={handleLmpChange} nextTab={nextTab} />
        </Tabs.Panel>

        <Tabs.Panel value="prenatal">
          <PrenatalTab formData={formData} setFormData={setFormData} newVisit={newVisit} setNewVisit={setNewVisit} handleVisitDateChange={handleVisitDateChange} handleBMIChange={handleBMIChange} addVisitToList={addVisitToList} removeVisit={removeVisit} editingVisitIndex={editingVisitIndex} startEditVisit={startEditVisit} nextTab={nextTab} />
        </Tabs.Panel>

        <Tabs.Panel value="immunization">
          <ImmunizationTab formData={formData} setFormData={setFormData} handleTdChange={handleTdChange} getImmunizationStats={getImmunizationStats} nextTab={nextTab} />
        </Tabs.Panel>

        <Tabs.Panel value="supplementation">
          <SupplementationTab formData={formData} setFormData={setFormData} newSupp={newSupp} setNewSupp={setNewSupp} addSupplement={addSupplement} removeSupplement={removeSupplement} editingSupp={editingSupp} startEditSupplement={startEditSupplement} totalIFA={totalIFA} totalMMS={totalMMS} ifaProgress={ifaProgress} nextTab={nextTab} />
        </Tabs.Panel>

        <Tabs.Panel value="labs">
          <LabsTab formData={formData} setFormData={setFormData} newLab={newLab} setNewLab={setNewLab} addLabLog={addLabLog} removeLabLog={removeLabLog} editingLabIndex={editingLabIndex} startEditLabLog={startEditLabLog} nextTab={nextTab} />
        </Tabs.Panel>

        <Tabs.Panel value="delivery">
          <DeliveryTab
            formData={formData}
            setFormData={setFormData}
            formErrors={formErrors}
            handleBirthWeightChange={handleBirthWeightChange}
            handleBabySexChange={handleBabySexChange}
            isAborted={isAborted}
            nextTab={nextTab}
          />
        </Tabs.Panel>

        <Tabs.Panel value="postnatal">
          <PostnatalTab formData={formData} setFormData={setFormData} newPostpartumLog={newPostpartumLog} setNewPostpartumLog={setNewPostpartumLog} addPostpartumLog={addPostpartumLog} removePostpartumLog={removePostpartumLog} editingPostpartumIndex={editingPostpartumIndex} startEditPostpartumLog={startEditPostpartumLog} handlePncDateChange={handlePncDateChange} postpartumProgress={postpartumProgress} />
        </Tabs.Panel>
      </Tabs>
      <Button fullWidth mt="lg" onClick={handleSubmit} color={formData.manual_risk ? 'red' : 'teal'} size="md" loading={submitting} disabled={submitting}>
        {isEditing ? 'Update Record' : (formData.manual_risk ? 'Save High Risk Record' : 'Save Normal Record')}
      </Button>
    </Modal>
  );
}
