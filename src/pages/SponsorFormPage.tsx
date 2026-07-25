import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SearchableSelect } from '@/components/forms/SearchableSelect';
import { PageHeader } from '@/components/forms/PageHeader';
import { FileField } from '@/components/forms/FileField';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { useCreateSponsor, useSponsor, useUpdateSponsor } from '@/hooks/useSponsors';

const SPONSOR_TYPES = ['Title', 'Gold', 'Silver', 'Bronze', 'General'];

export default function SponsorFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const sponsorQuery = useSponsor(id);
  const createMutation = useCreateSponsor();
  const updateMutation = useUpdateSponsor();

  const [name, setName] = useState('');
  const [supportedUrl, setSupportedUrl] = useState('');
  const [extraInfo, setExtraInfo] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [sponsorType, setSponsorType] = useState('Gold');

  useEffect(() => {
    if (sponsorQuery.data) {
      setName(sponsorQuery.data.name);
      setSupportedUrl(sponsorQuery.data.supported_url ?? '');
      setExtraInfo(sponsorQuery.data.extra_info ?? '');
      setSponsorType(sponsorQuery.data.sponsor_type);
    }
  }, [sponsorQuery.data]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      name: name.trim(),
      supported_url: supportedUrl || null,
      extra_info: extraInfo || null,
      image,
      sponsor_type: sponsorType,
    };
    if (isEdit && id) {
      updateMutation.mutate({ id, payload }, { onSuccess: () => navigate('/dashboard/sponsors') });
      return;
    }
    createMutation.mutate(payload, { onSuccess: () => navigate('/dashboard/sponsors') });
  };

  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <TenantRequired>
      <div className="space-y-6">
        <PageHeader
          title={isEdit ? 'Edit sponsor' : 'Create sponsor'}
          backTo="/dashboard/sponsors"
        />
        {isEdit && sponsorQuery.isLoading ? (
          <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
        ) : (
          <form
            onSubmit={handleSubmit}
            className="max-w-xl space-y-4 rounded-lg border bg-white p-4 sm:p-6"
          >
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input
              label="Website URL"
              value={supportedUrl}
              onChange={(e) => setSupportedUrl(e.target.value)}
            />
            <FileField
              label="Sponsor logo"
              onChange={setImage}
              currentUrl={sponsorQuery.data?.image}
            />
            <Input
              label="Extra info"
              value={extraInfo}
              onChange={(e) => setExtraInfo(e.target.value)}
            />
            <SearchableSelect
              label="Sponsor type"
              value={sponsorType}
              onChange={setSponsorType}
              options={SPONSOR_TYPES.map((type) => ({
                value: type,
                label: type,
              }))}
              searchable={false}
            />
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create sponsor'}
            </Button>
          </form>
        )}
      </div>
    </TenantRequired>
  );
}
