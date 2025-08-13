import CreateTeamDialog from '@/components/teams-table/team/create-team-dialog';
import TeamsTable from '@/components/teams-table/team/teams-table';

export default function TeamsPage() {
  return (
    <div>
      <div className='flex items-center justify-between'>
        <h1 className='py-6 text-xl font-bold'>Manejo de Equipos y Grupos</h1>
        <CreateTeamDialog />
      </div>
      <TeamsTable />
    </div>
  );
}
